import requests
import random
import string

# backend base url (running on port 5000)
BASE_URL = "http://localhost:5000/api"


# generate random email so registration doesn't fail on duplicate
def random_email():
    tag = "".join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"testuser_{tag}@test.com"


# helper to register user and get token for protected routes
def register_and_get_token():
    payload = {
        "name": "Test User",
        "email": random_email(),
        "password": "password123",
    }
    resp = requests.post(f"{BASE_URL}/auth/register", json=payload)
    assert resp.status_code == 201
    return resp.json()["token"]


# attach token in header
def auth_header(token):
    return {"Authorization": f"Bearer {token}"}


class TestRegister:

    # test normal user registration
    def test_register_success(self):
        resp = requests.post(f"{BASE_URL}/auth/register", json={
            "name": "Student",
            "email": random_email(),
            "password": "secret123",
        })
        assert resp.status_code == 201
        assert "token" in resp.json()

    # test missing fields
    def test_register_missing_fields(self):
        resp = requests.post(f"{BASE_URL}/auth/register", json={
            "email": random_email(),
        })
        assert resp.status_code == 400

    # same email should not register twice
    def test_register_duplicate_email(self):
        email = random_email()
        payload = {"name": "Dup", "email": email, "password": "abc123"}

        requests.post(f"{BASE_URL}/auth/register", json=payload)
        second = requests.post(f"{BASE_URL}/auth/register", json=payload)

        assert second.status_code == 400


class TestLogin:

    # login with correct credentials
    def test_login_success(self):
        email = random_email()
        password = "mypassword"

        # first register
        requests.post(f"{BASE_URL}/auth/register", json={
            "name": "Login Test",
            "email": email,
            "password": password,
        })

        # then login
        resp = requests.post(f"{BASE_URL}/auth/login", json={
            "email": email,
            "password": password,
        })

        assert resp.status_code == 200
        assert "token" in resp.json()

    # wrong password case
    def test_login_wrong_password(self):
        email = random_email()

        requests.post(f"{BASE_URL}/auth/register", json={
            "name": "Test",
            "email": email,
            "password": "correct",
        })

        resp = requests.post(f"{BASE_URL}/auth/login", json={
            "email": email,
            "password": "wrong",
        })

        assert resp.status_code == 400


class TestRestaurants:

    # get all restaurants
    def test_get_all_restaurants(self):
        resp = requests.get(f"{BASE_URL}/restaurants")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    # get menu of one restaurant
    def test_get_menu(self):
        resp = requests.get(f"{BASE_URL}/restaurants/1/menu")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


class TestCart:

    # cart without login should fail
    def test_cart_without_login(self):
        resp = requests.get(f"{BASE_URL}/cart")
        assert resp.status_code == 401

    # add item to cart
    def test_add_to_cart(self):
        token = register_and_get_token()

        item = {
            "menu_item_id": 1,
            "name": "Pizza",
            "price": 200,
            "restaurant_id": 1,
        }

        resp = requests.post(
            f"{BASE_URL}/cart/add",
            json=item,
            headers=auth_header(token),
        )

        assert resp.status_code == 200

    # remove item from cart
    def test_remove_from_cart(self):
        token = register_and_get_token()

        # first add item
        requests.post(f"{BASE_URL}/cart/add", json={
            "menu_item_id": 1,
            "name": "Pizza",
            "price": 200,
            "restaurant_id": 1,
        }, headers=auth_header(token))

        # then remove
        resp = requests.post(
            f"{BASE_URL}/cart/remove",
            json={"menu_item_id": 1},
            headers=auth_header(token),
        )

        assert resp.status_code == 200


class TestOrders:

    # accessing orders without login
    def test_orders_without_login(self):
        resp = requests.get(f"{BASE_URL}/orders/my")
        assert resp.status_code == 401

    # new user should have empty orders
    def test_empty_orders(self):
        token = register_and_get_token()

        resp = requests.get(
            f"{BASE_URL}/orders/my",
            headers=auth_header(token),
        )

        assert resp.status_code == 200
        assert resp.json() == []


class TestChat:

    # simple chat request
    def test_chat(self):
        resp = requests.post(f"{BASE_URL}/chat", json={"message": "Hi"})
        assert resp.status_code == 200

    # missing message case
    def test_chat_empty(self):
        resp = requests.post(f"{BASE_URL}/chat", json={})
        assert resp.status_code == 400