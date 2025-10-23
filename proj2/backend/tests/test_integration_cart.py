def auth_header(client, email, password, name="Bob"):
    # ensure user exists
    client.post("/users/register", json={"email": email, "name": name, "password": password})
    # login
    r = client.post("/auth/login", json={"email": email, "password": password})
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_cart_lifecycle(client):
    hdrs = auth_header(client, "bob@example.com", "s3cret")
    # list cart items (expect empty)
    r = client.get("/cart/", headers=hdrs)

    assert r.status_code == 200
    assert r.json().get("items") == None

    # clear (idempotent)
    r = client.delete("/cart/clear", headers=hdrs)
    assert r.status_code == 200
    assert r.json()["status"] == "cleared"
