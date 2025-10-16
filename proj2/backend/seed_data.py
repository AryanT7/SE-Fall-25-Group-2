import os
import random
from datetime import datetime, timedelta

from app.database import SessionLocal, engine, Base
from app import models
from app.auth import hash_password


def ensure_schema():
    # Make sure tables exist before seeding
    Base.metadata.create_all(bind=engine)


def seed_users(db, num_users: int = 10):
    users = []
    for i in range(num_users):
        email = f"user{i+1}@example.com"
        name = f"User {i+1}"
        password = hash_password("Password123!")
        user = models.User(
            email=email,
            name=name,
            hashed_password=password,
            role=models.Role.USER,
            is_active=True,
        )
        db.add(user)
        users.append(user)
    db.commit()
    for u in users:
        db.refresh(u)
    return users


def seed_cafes(db, owner: models.User | None, num_cafes: int = 10):
    cafes = []
    for i in range(num_cafes):
        cafe = models.Cafe(
            name=f"Cafe {i+1}",
            address=f"{100 + i} Main St",
            active=True,
            owner_id=owner.id if owner else None,
        )
        db.add(cafe)
        cafes.append(cafe)
    db.commit()
    for c in cafes:
        db.refresh(c)
    return cafes


def seed_items(db, cafes: list[models.Cafe], items_per_cafe: int = 5):
    items = []
    for cafe in cafes:
        for i in range(items_per_cafe):
            item = models.Item(
                cafe_id=cafe.id,
                name=f"Item {cafe.id}-{i+1}",
                description="Tasty item",
                ingredients="ingredient1, ingredient2",
                calories=random.randint(100, 900),
                price=round(random.uniform(3.0, 25.0), 2),
                quantity="1 serving",
                servings=1.0,
                veg_flag=bool(random.getrandbits(1)),
                kind="meal",
                active=True,
            )
            db.add(item)
            items.append(item)
    db.commit()
    for it in items:
        db.refresh(it)
    return items


def seed_orders(db, users: list[models.User], cafes: list[models.Cafe], items: list[models.Item], orders_per_user: int = 10):
    # Build a map cafe_id -> items
    cafe_to_items: dict[int, list[models.Item]] = {}
    for it in items:
        cafe_to_items.setdefault(it.cafe_id, []).append(it)

    for u in users:
        for _ in range(orders_per_user):
            cafe = random.choice(cafes)
            order = models.Order(
                user_id=u.id,
                cafe_id=cafe.id,
                status=models.OrderStatus.PENDING,
                created_at=datetime.utcnow() - timedelta(minutes=random.randint(0, 10_000)),
                pickup_code=str(random.randint(100000, 999999)),
                total_price=0.0,
                total_calories=0,
            )
            db.add(order)
            db.flush()  # ensure order.id

            # Add 1-3 items per order
            chosen_items = random.sample(cafe_to_items.get(cafe.id, []), k=min(len(cafe_to_items.get(cafe.id, [])), random.randint(1, 3)))
            for it in chosen_items:
                qty = random.randint(1, 3)
                db.add(models.OrderItem(
                    order_id=order.id,
                    item_id=it.id,
                    quantity=qty,
                    assignee_user_id=u.id,
                    subtotal_price=round(it.price * qty, 2),
                    subtotal_calories=it.calories * qty,
                ))
                order.total_price += round(it.price * qty, 2)
                order.total_calories += it.calories * qty

            # Optional payment record
            db.add(models.Payment(
                order_id=order.id,
                provider="MOCK",
                amount=round(order.total_price, 2),
                status=models.PaymentStatus.PAID,
                created_at=datetime.utcnow(),
            ))

        db.commit()


def main():
    ensure_schema()
    db = SessionLocal()
    try:
        # Choose first user as owner for cafes after creation
        users = seed_users(db, 10)
        cafes = seed_cafes(db, owner=users[0] if users else None, num_cafes=10)
        items = seed_items(db, cafes, items_per_cafe=8)
        seed_orders(db, users, cafes, items, orders_per_user=10)
        print("Seed completed: 10 users, 10 cafes, ~80 items, 100 orders.")
    finally:
        db.close()


if __name__ == "__main__":
    # Respect env vars already configured for DB connection
    main()


