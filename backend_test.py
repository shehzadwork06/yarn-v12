#!/usr/bin/env python3
"""
Backend API Testing for Purchase Returns Functionality
Tests the yarn/chemical ERP system purchase return features
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, List, Optional, Any

class PurchaseReturnsAPITester:
    def __init__(self, base_url: str = "https://purchase-lot-cleaner.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_data = {}
        
        # Headers for YARN business mode
        self.headers = {
            'Content-Type': 'application/json',
            'X-Business-Mode': 'YARN'
        }

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        if details and success:
            print(f"   {details}")

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, expected_status: int = 200) -> tuple[bool, Dict]:
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = self.headers.copy()
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"status_code": response.status_code, "text": response.text}

            return success, response_data

        except Exception as e:
            return False, {"error": str(e)}

    def test_authentication(self) -> bool:
        """Test login with admin credentials"""
        print("\n🔐 Testing Authentication...")
        
        success, response = self.make_request(
            'POST', 
            'auth/login',
            {"username": "admin", "password": "admin123"},
            200
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.log_test("Admin login", True, f"Token received")
            return True
        else:
            self.log_test("Admin login", False, f"Response: {response}")
            return False

    def setup_test_data(self) -> bool:
        """Create test data for purchase returns testing"""
        print("\n📦 Setting up test data...")
        
        # Create test supplier
        supplier_data = {
            "name": "Test Supplier for Returns",
            "phone": "1234567890",
            "address": "Test Address",
            "credit_terms": "30 days",
            "opening_balance": 0
        }
        
        success, response = self.make_request('POST', 'suppliers', supplier_data, 201)
        if not success:
            self.log_test("Create test supplier", False, f"Response: {response}")
            return False
        
        self.test_data['supplier_id'] = response['id']
        self.log_test("Create test supplier", True, f"Supplier ID: {response['id']}")

        # Get product categories
        success, response = self.make_request('GET', 'categories')
        if not success or not response:
            self.log_test("Get categories", False, f"Response: {response}")
            return False
        
        category_id = response[0]['id'] if response else 1
        self.test_data['category_id'] = category_id
        self.log_test("Get categories", True, f"Using category ID: {category_id}")

        # Create test products
        products = [
            {"name": "Test Raw Yarn 001", "type": "RAW_YARN", "unit": "No Of Cones"},
            {"name": "Test Raw Yarn 002", "type": "RAW_YARN", "unit": "No Of Cones"}
        ]
        
        self.test_data['products'] = []
        for product in products:
            product['category_id'] = category_id
            success, response = self.make_request('POST', 'products', product, 201)
            if success:
                self.test_data['products'].append(response)
                self.log_test(f"Create product {product['name']}", True, f"Product ID: {response['id']}")
            else:
                self.log_test(f"Create product {product['name']}", False, f"Response: {response}")
                return False

        # Create test purchase
        purchase_data = {
            "supplier_id": self.test_data['supplier_id'],
            "date": datetime.now().strftime('%Y-%m-%d'),
            "notes": "Test purchase for returns testing",
            "items": [
                {
                    "product_id": self.test_data['products'][0]['id'],
                    "quantity": 100,
                    "rate": 10.0
                },
                {
                    "product_id": self.test_data['products'][1]['id'],
                    "quantity": 50,
                    "rate": 15.0
                }
            ]
        }
        
        success, response = self.make_request('POST', 'purchases', purchase_data, 201)
        if not success:
            self.log_test("Create test purchase", False, f"Response: {response}")
            return False
        
        self.test_data['purchase'] = response
        self.log_test("Create test purchase", True, f"Purchase ID: {response['id']}")

        # Get lots created by the purchase
        success, response = self.make_request('GET', 'lots')
        if success:
            # Filter lots for our purchase
            purchase_lots = [lot for lot in response if lot.get('purchase_id') == self.test_data['purchase']['id']]
            self.test_data['lots'] = purchase_lots
            self.log_test("Get purchase lots", True, f"Found {len(purchase_lots)} lots")
        else:
            self.log_test("Get purchase lots", False, f"Response: {response}")
            return False

        return True

    def test_create_partial_return(self) -> bool:
        """Test creating a partial purchase return"""
        print("\n📤 Testing Partial Purchase Return...")
        
        if not self.test_data.get('lots'):
            self.log_test("Partial return - no lots", False, "No lots available for testing")
            return False

        lot = self.test_data['lots'][0]
        return_data = {
            "purchase_id": self.test_data['purchase']['id'],
            "date": datetime.now().strftime('%Y-%m-%d'),
            "reason": "Partial return - quality issue",
            "notes": "Testing partial return functionality",
            "items": [
                {
                    "lot_id": lot['id'],
                    "product_id": lot['product_id'],
                    "quantity": 30,  # Partial return of 30 out of 100
                    "rate": 10.0
                }
            ]
        }
        
        success, response = self.make_request('POST', 'purchase-returns', return_data, 201)
        if success:
            self.test_data['partial_return'] = response
            self.log_test("Create partial return", True, f"Return ID: {response['id']}")
            
            # Verify lot quantity was reduced
            success, lot_response = self.make_request('GET', f'lots/{lot["id"]}')
            if success:
                new_quantity = lot_response.get('current_quantity', 0)
                expected_quantity = 70  # 100 - 30
                if new_quantity == expected_quantity:
                    self.log_test("Verify lot quantity reduction", True, f"Quantity: {new_quantity}")
                else:
                    self.log_test("Verify lot quantity reduction", False, f"Expected {expected_quantity}, got {new_quantity}")
            
            return True
        else:
            self.log_test("Create partial return", False, f"Response: {response}")
            return False

    def test_create_full_return(self) -> bool:
        """Test creating a full purchase return that deletes the purchase"""
        print("\n📤 Testing Full Purchase Return...")
        
        # Create a new purchase for full return testing
        purchase_data = {
            "supplier_id": self.test_data['supplier_id'],
            "date": datetime.now().strftime('%Y-%m-%d'),
            "notes": "Test purchase for full return",
            "items": [
                {
                    "product_id": self.test_data['products'][0]['id'],
                    "quantity": 20,
                    "rate": 12.0
                }
            ]
        }
        
        success, purchase_response = self.make_request('POST', 'purchases', purchase_data, 201)
        if not success:
            self.log_test("Create purchase for full return", False, f"Response: {purchase_response}")
            return False
        
        full_return_purchase = purchase_response
        self.log_test("Create purchase for full return", True, f"Purchase ID: {full_return_purchase['id']}")

        # Get the lot for this purchase
        success, lots_response = self.make_request('GET', 'lots')
        if not success:
            self.log_test("Get lots for full return", False, f"Response: {lots_response}")
            return False
        
        purchase_lot = None
        for lot in lots_response:
            if lot.get('purchase_id') == full_return_purchase['id']:
                purchase_lot = lot
                break
        
        if not purchase_lot:
            self.log_test("Find lot for full return", False, "No lot found for the purchase")
            return False

        # Create full return
        return_data = {
            "purchase_id": full_return_purchase['id'],
            "date": datetime.now().strftime('%Y-%m-%d'),
            "reason": "Full return - complete rejection",
            "notes": "Testing full return functionality",
            "items": [
                {
                    "lot_id": purchase_lot['id'],
                    "product_id": purchase_lot['product_id'],
                    "quantity": 20,  # Full quantity
                    "rate": 12.0
                }
            ]
        }
        
        success, response = self.make_request('POST', 'purchase-returns', return_data, 201)
        if success:
            self.test_data['full_return'] = response
            self.log_test("Create full return", True, f"Return ID: {response['id']}")
            
            # Verify purchase was deleted
            success, purchase_check = self.make_request('GET', f'purchases/{full_return_purchase["id"]}', expected_status=404)
            if success:  # 404 is expected for deleted purchase
                self.log_test("Verify purchase deletion", True, "Purchase successfully deleted")
            else:
                self.log_test("Verify purchase deletion", False, "Purchase still exists")
            
            # Verify lot status is RETURNED
            success, lot_response = self.make_request('GET', f'lots/{purchase_lot["id"]}')
            if success:
                lot_status = lot_response.get('status')
                if lot_status == 'RETURNED':
                    self.log_test("Verify lot status RETURNED", True, f"Status: {lot_status}")
                else:
                    self.log_test("Verify lot status RETURNED", False, f"Expected RETURNED, got {lot_status}")
            
            return True
        else:
            self.log_test("Create full return", False, f"Response: {response}")
            return False

    def test_get_purchase_returns(self) -> bool:
        """Test retrieving purchase returns"""
        print("\n📋 Testing Get Purchase Returns...")
        
        success, response = self.make_request('GET', 'purchase-returns')
        if success:
            returns_count = len(response) if isinstance(response, list) else 0
            self.log_test("Get all purchase returns", True, f"Found {returns_count} returns")
            
            # Verify our test returns are in the list
            if self.test_data.get('partial_return'):
                partial_found = any(r['id'] == self.test_data['partial_return']['id'] for r in response)
                self.log_test("Find partial return in list", partial_found, "Partial return found" if partial_found else "Partial return not found")
            
            if self.test_data.get('full_return'):
                full_found = any(r['id'] == self.test_data['full_return']['id'] for r in response)
                self.log_test("Find full return in list", full_found, "Full return found" if full_found else "Full return not found")
            
            return True
        else:
            self.log_test("Get all purchase returns", False, f"Response: {response}")
            return False

    def test_get_specific_return(self) -> bool:
        """Test retrieving a specific purchase return with items"""
        print("\n📄 Testing Get Specific Purchase Return...")
        
        if not self.test_data.get('partial_return'):
            self.log_test("Get specific return - no return", False, "No partial return available")
            return False
        
        return_id = self.test_data['partial_return']['id']
        success, response = self.make_request('GET', f'purchase-returns/{return_id}')
        
        if success:
            self.log_test("Get specific return", True, f"Return ID: {response.get('id')}")
            
            # Verify items are included
            items = response.get('items', [])
            if items:
                self.log_test("Verify return items included", True, f"Found {len(items)} items")
                
                # Check item details
                item = items[0]
                expected_fields = ['lot_id', 'product_id', 'quantity', 'rate', 'amount']
                missing_fields = [field for field in expected_fields if field not in item]
                
                if not missing_fields:
                    self.log_test("Verify item fields", True, "All required fields present")
                else:
                    self.log_test("Verify item fields", False, f"Missing fields: {missing_fields}")
            else:
                self.log_test("Verify return items included", False, "No items found")
            
            return True
        else:
            self.log_test("Get specific return", False, f"Response: {response}")
            return False

    def test_edit_purchase_return(self) -> bool:
        """Test editing a purchase return"""
        print("\n✏️ Testing Edit Purchase Return...")
        
        if not self.test_data.get('partial_return'):
            self.log_test("Edit return - no return", False, "No partial return available")
            return False
        
        return_id = self.test_data['partial_return']['id']
        
        # Get current return details
        success, current_return = self.make_request('GET', f'purchase-returns/{return_id}')
        if not success:
            self.log_test("Get current return for edit", False, f"Response: {current_return}")
            return False
        
        # Modify the return - change quantity and reason
        edit_data = {
            "date": current_return['date'],
            "reason": "Updated reason - quality and quantity issues",
            "notes": "Updated notes - edited via API test",
            "items": [
                {
                    "lot_id": current_return['items'][0]['lot_id'],
                    "product_id": current_return['items'][0]['product_id'],
                    "quantity": 40,  # Changed from 30 to 40
                    "rate": 10.0
                }
            ]
        }
        
        success, response = self.make_request('PUT', f'purchase-returns/{return_id}', edit_data)
        if success:
            self.log_test("Edit purchase return", True, f"Return updated")
            
            # Verify the changes
            success, updated_return = self.make_request('GET', f'purchase-returns/{return_id}')
            if success:
                if updated_return['reason'] == edit_data['reason']:
                    self.log_test("Verify reason update", True, "Reason updated correctly")
                else:
                    self.log_test("Verify reason update", False, f"Expected: {edit_data['reason']}, Got: {updated_return['reason']}")
                
                if updated_return['items'][0]['quantity'] == 40:
                    self.log_test("Verify quantity update", True, "Quantity updated correctly")
                else:
                    self.log_test("Verify quantity update", False, f"Expected: 40, Got: {updated_return['items'][0]['quantity']}")
            
            return True
        else:
            self.log_test("Edit purchase return", False, f"Response: {response}")
            return False

    def test_error_scenarios(self) -> bool:
        """Test error handling scenarios"""
        print("\n⚠️ Testing Error Scenarios...")
        
        # Test return with invalid purchase ID
        invalid_return_data = {
            "purchase_id": 99999,
            "reason": "Test invalid purchase",
            "items": [{"lot_id": 1, "product_id": 1, "quantity": 10, "rate": 5.0}]
        }
        
        success, response = self.make_request('POST', 'purchase-returns', invalid_return_data, 400)
        if success:  # 400 is expected
            self.log_test("Invalid purchase ID error", True, "Correctly rejected invalid purchase")
        else:
            self.log_test("Invalid purchase ID error", False, f"Expected 400, got different response: {response}")
        
        # Test return with missing required fields
        incomplete_data = {
            "purchase_id": self.test_data['purchase']['id'],
            # Missing reason and items
        }
        
        success, response = self.make_request('POST', 'purchase-returns', incomplete_data, 400)
        if success:  # 400 is expected
            self.log_test("Missing required fields error", True, "Correctly rejected incomplete data")
        else:
            self.log_test("Missing required fields error", False, f"Expected 400, got different response: {response}")
        
        # Test get non-existent return
        success, response = self.make_request('GET', 'purchase-returns/99999', expected_status=404)
        if success:  # 404 is expected
            self.log_test("Non-existent return error", True, "Correctly returned 404 for non-existent return")
        else:
            self.log_test("Non-existent return error", False, f"Expected 404, got different response: {response}")
        
        return True

    def test_data_persistence(self) -> bool:
        """Test that return data persists even after purchase deletion"""
        print("\n💾 Testing Data Persistence...")
        
        if not self.test_data.get('full_return'):
            self.log_test("Data persistence - no full return", False, "No full return available")
            return False
        
        # Verify the full return still exists and has snapshot data
        return_id = self.test_data['full_return']['id']
        success, response = self.make_request('GET', f'purchase-returns/{return_id}')
        
        if success:
            self.log_test("Full return still accessible", True, "Return data preserved")
            
            # Check for snapshot fields that should preserve original purchase info
            snapshot_fields = ['purchase_number', 'supplier_name']
            has_snapshots = any(field in response for field in snapshot_fields)
            
            if has_snapshots:
                self.log_test("Snapshot data preserved", True, "Purchase info preserved in return")
            else:
                self.log_test("Snapshot data preserved", False, "Missing snapshot fields")
            
            # Verify items still have lot information
            items = response.get('items', [])
            if items and items[0].get('lot_number'):
                self.log_test("Lot snapshot preserved", True, "Lot information preserved")
            else:
                self.log_test("Lot snapshot preserved", False, "Lot information missing")
            
            return True
        else:
            self.log_test("Full return still accessible", False, f"Response: {response}")
            return False

    def run_all_tests(self) -> bool:
        """Run all purchase returns tests"""
        print("🧪 Starting Purchase Returns API Testing...")
        print(f"Base URL: {self.base_url}")
        print(f"Business Mode: YARN")
        
        # Authentication
        if not self.test_authentication():
            print("❌ Authentication failed - stopping tests")
            return False
        
        # Setup test data
        if not self.setup_test_data():
            print("❌ Test data setup failed - stopping tests")
            return False
        
        # Run all test scenarios
        test_methods = [
            self.test_create_partial_return,
            self.test_create_full_return,
            self.test_get_purchase_returns,
            self.test_get_specific_return,
            self.test_edit_purchase_return,
            self.test_error_scenarios,
            self.test_data_persistence
        ]
        
        for test_method in test_methods:
            try:
                test_method()
            except Exception as e:
                print(f"❌ {test_method.__name__} failed with exception: {str(e)}")
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = PurchaseReturnsAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⏹️ Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Test execution failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())