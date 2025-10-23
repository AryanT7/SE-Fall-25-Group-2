#!/usr/bin/env python3
"""
Seed data via FastAPI endpoints instead of direct database access.
Creates 10 users, 10 cafes, and 100 orders (10 per user).
"""

import requests
import json
import random
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1" if "/api/v1" in BASE_URL else BASE_URL

# Test data
USERS = [
    {"email": f"user{i+1}@example.com", "name": f"User {i+1}", "password": "Password123!", "role": "User"}
    for i in range(10)
]

CAFES = [
    {"name": f"Cafe {i+1}", "address": f"{100 + i} Main St"}
    for i in range(10)
]

def make_request(method, endpoint, data=None, headers=None):
    """Make HTTP request and return response."""
    url = f"{API_BASE}{endpoint}"
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=headers)
        elif method.upper() == "PUT":
            response = requests.put(url, json=data, headers=headers)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=headers)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error {method} {endpoint}: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return None

def register_user(user_data):
    """Register a new user."""
    return make_request("POST", "/users/register", user_data)

def login_user(email, password):
    """Login user and return token."""
    login_data = {"email": email, "password": password}
    response = make_request("POST", "/auth/login", login_data)
    if response and "access_token" in response:
        return response["access_token"]
    return None

def create_cafe(cafe_data, token):
    """Create a new cafe (requires owner/admin role)."""
    headers = {"Authorization": f"Bearer {token}"}
    return make_request("POST", "/cafes", cafe_data, headers)

def create_item(cafe_id, item_data, token):
    """Create a menu item for a specific cafe."""
    headers = {"Authorization": f"Bearer {token}"}
    return make_request("POST", f"/items/{cafe_id}", item_data, headers)

def add_to_cart(item_id, quantity, token):
    """Add item to cart."""
    headers = {"Authorization": f"Bearer {token}"}
    data = {"item_id": item_id, "quantity": quantity}
    return make_request("POST", "/cart/add", data, headers)

def place_order(cafe_id, token):
    """Place an order from cart."""
    headers = {"Authorization": f"Bearer {token}"}
    data = {"cafe_id": cafe_id}
    return make_request("POST", "/orders/place", data, headers)

def get_cafes():
    """Get list of cafes."""
    return make_request("GET", "/cafes")

def get_items(cafe_id=None):
    """Get list of items, optionally filtered by cafe."""
    endpoint = f"/items?cafe_id={cafe_id}" if cafe_id else "/items"
    return make_request("GET", endpoint)

def get_current_user(token):
    """Get current user info."""
    headers = {"Authorization": f"Bearer {token}"}
    # Try different possible endpoints
    endpoints = ["/users/me", "/me", "/user/profile"]
    for endpoint in endpoints:
        response = make_request("GET", endpoint, headers=headers)
        if response:
            return response
    return None

def seed_admin_user():
    """Create admin user using the seed_user endpoint."""
    # The seed_user endpoint expects query parameters, not JSON body
    params = {
        "email": "admin@example.com",
        "name": "Admin User", 
        "password": "admin123",
        "role": "ADMIN"
    }
    # Build query string
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    endpoint = f"/auth/seed_user?{query_string}"
    return make_request("POST", endpoint)

def seed_users():
    """Register all users or login if they already exist."""
    print("Creating/checking users...")
    users = []
    for user_data in USERS:
        # Try to register first
        response = register_user(user_data)
        if response:
            users.append(response)
            print(f"✓ Created user: {user_data['email']}")
            print("------------ Response -----------")
            print(f"{response}")
            print("------------ Response -----------")
        else:
            # If registration failed, try to login (user might already exist)
            print(f"User {user_data['email']} might already exist, trying to login...")
            token = login_user(user_data['email'], user_data['password'])
            if token:
                # Get actual user info from the API
                user_info = get_current_user(token)
                if user_info:
                    users.append(user_info)
                    print(f"✓ Logged in existing user: {user_data['email']}")
                else:
                    # Fallback if /users/me doesn't exist
                    user_info = {
                        "id": len(users) + 1,  # Temporary ID
                        "email": user_data['email'],
                        "name": user_data['name']
                    }
                    users.append(user_info)
                    print(f"✓ Logged in existing user: {user_data['email']} (using fallback)")
            else:
                print(f"✗ Failed to create or login user: {user_data['email']}")
    return users

def seed_cafes(admin_token):
    """Create cafes using admin token."""
    print("Creating cafes...")
    cafes = []
    for i, cafe_data in enumerate(CAFES):
        # Use admin endpoint to create cafes (query params format)
        headers = {"Authorization": f"Bearer {admin_token}"}
        # The admin endpoint expects query parameters, not JSON body
        params = {
            "name": cafe_data["name"],
            "address": cafe_data["address"],
            "owner_id": None
        }
        # Build query string
        query_string = "&".join([f"{k}={v}" for k, v in params.items() if v is not None])
        endpoint = f"/admin/cafes?{query_string}"
        response = make_request("POST", endpoint, headers=headers)
        if response:
            cafes.append(response)
            print(f"✓ Created cafe: {cafe_data['name']}")
        else:
            print(f"✗ Failed to create cafe: {cafe_data['name']}")
    return cafes

def seed_items(cafes, admin_token):
    """Create menu items for each cafe."""
    print("Creating menu items...")
    items = []
    for i, cafe in enumerate(cafes):
        cafe_name = f"Cafe {i+1}"  # Use index-based name since cafe object might not have name
        # Create 5-8 items per cafe
        num_items = random.randint(5, 8)
        for j in range(num_items):
            item_data = {
                "name": f"Item {cafe['id']}-{j+1}",
                "description": "Delicious menu item",
                "ingredients": "ingredient1, ingredient2",
                "calories": random.randint(100, 900),
                "price": round(random.uniform(3.0, 25.0), 2),
                "quantity": "1 serving",
                "servings": 1.0,
                "veg_flag": bool(random.getrandbits(1)),
                "kind": "meal",
                "active": True
            }
            response = create_item(cafe["id"], item_data, admin_token)
            if response:
                items.append(response)
                print(f"✓ Created item: {item_data['name']} for {cafe_name}")
            else:
                print(f"✗ Failed to create item: {item_data['name']}")
    return items

def seed_orders(users, cafes, items, owner_token):
    """Create orders for each user."""
    print("Creating orders...")
    orders = []
    
    # Get all items grouped by cafe
    cafe_items = {}
    for item in items:
        cafe_id = item.get("cafe_id")
        if cafe_id not in cafe_items:
            cafe_items[cafe_id] = []
        cafe_items[cafe_id].append(item)
    
    for user in users:
        # Login as this user
        user_token = login_user(user["email"], "Password123!")
        if not user_token:
            print(f"✗ Failed to login user: {user['email']}")
            continue
            
        # Create 10 orders per user
        for order_num in range(10):
            # Pick a random cafe
            cafe = random.choice(cafes)
            cafe_id = cafe["id"]
            
            # Pick 1-3 items from this cafe
            available_items = cafe_items.get(cafe_id, [])
            if not available_items:
                continue
                
            chosen_items = random.sample(
                available_items, 
                k=min(len(available_items), random.randint(1, 3))
            )
            
            # Add items to cart first
            for item in chosen_items:
                quantity = random.randint(1, 3)
                cart_response = add_to_cart(item["id"], quantity, user_token)
                if not cart_response:
                    print(f"✗ Failed to add item {item['id']} to cart")
            
            # Place order from cart
            response = place_order(cafe_id, user_token)
            if response:
                orders.append(response)
                print(f"✓ Created order {order_num+1} for {user['email']} at Cafe {cafe_id}")
            else:
                print(f"✗ Failed to create order {order_num+1} for {user['email']}")
    
    return orders

def main():
    """Main seeding function."""
    print("🌱 Starting API-based seeding...")
    print(f"Target API: {API_BASE}")
    
    # Check if API is running
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code != 200:
            print(f"❌ API not responding at {BASE_URL}")
            return
    except requests.exceptions.RequestException:
        print(f"❌ Cannot connect to API at {BASE_URL}")
        print("Make sure your FastAPI server is running on localhost:8000")
        return
    
    print("✓ API is responding")
    
    # Step 1: Create users
    users = seed_users()
    if not users:
        print("❌ No users created, aborting")
        return
    
    # Step 2: Login as first user and promote to OWNER if needed
    owner_email = users[0]["email"]
    owner_token = login_user(owner_email, "Password123!")
    if not owner_token:
        print("❌ Failed to login as owner, aborting")
        return
    
    # Create admin user using seed_user endpoint
    print("Creating admin user...")
    admin_response = seed_admin_user()
    if admin_response:
        print("✓ Created admin user")
    else:
        print("⚠️ Admin user might already exist")
    
    # Login as admin
    admin_token = login_user("admin@example.com", "admin123")
    if not admin_token:
        print("❌ Failed to login as admin, aborting")
        return
    else:
        print("✓ Logged in as admin")
    
    # Try to create cafes with admin token, fallback to regular user
    cafes = []
    if admin_token:
        print("Creating cafes with admin token...")
        cafes = seed_cafes(admin_token)
    
    if not cafes and owner_token:
        print("Admin failed, trying with regular user token...")
        # Try regular cafe creation endpoint
        for cafe_data in CAFES:
            response = create_cafe(cafe_data, owner_token)
            if response:
                cafes.append(response)
                print(f"✓ Created cafe: {cafe_data['name']}")
            else:
                print(f"✗ Failed to create cafe: {cafe_data['name']}")
    
    if not cafes:
        print("❌ No cafes created with any method, aborting")
        return
    
    # Step 3: Create menu items
    items = []
    if admin_token:
        items = seed_items(cafes, admin_token)
    
    if not items and owner_token:
        print("Admin failed for items, trying with regular user token...")
        items = seed_items(cafes, owner_token)
    
    if not items:
        print("❌ No items created with any method, aborting")
        return
    
    # Step 4: Create orders
    orders = seed_orders(users, cafes, items, owner_token)
    
    # Summary
    print("\n🎉 Seeding completed!")
    print(f"✓ Users created: {len(users)}")
    print(f"✓ Cafes created: {len(cafes)}")
    print(f"✓ Items created: {len(items)}")
    print(f"✓ Orders created: {len(orders)}")
    
    # Test login for a few users
    print("\n🔐 Testing user logins:")
    for i, user in enumerate(users[:3]):
        token = login_user(user["email"], "Password123!")
        if token:
            print(f"✓ {user['email']} - Login successful")
        else:
            print(f"✗ {user['email']} - Login failed")

if __name__ == "__main__":
    main()
