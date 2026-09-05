import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { api } from "../services/api";
import "./restaurant.css";

const categories = ["All", "Starters", "Main Course", "Riverside Specials", "Desserts", "Beverages"];

function Restaurant() {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [vegOnly, setVegOnly] = useState(false);

  // Cart state: { [foodItemId]: { item, quantity } }
  const [cart, setCart] = useState({});
  const [roomNumber, setRoomNumber] = useState("101");
  const [deliveryType, setDeliveryType] = useState("room"); // 'room' or 'table'
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadFoodItems();
  }, []);

  const loadFoodItems = async () => {
    try {
      setLoading(true);
      const res = await api.getFoodItems(null, true);
      if (res.success) {
        setFoodItems(res.items);
      }
    } catch (err) {
      console.error("Failed to load food menu:", err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const currentQty = prev[item._id]?.quantity || 0;
      return {
        ...prev,
        [item._id]: { item, quantity: currentQty + 1 },
      };
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const currentQty = prev[itemId]?.quantity || 0;
      if (currentQty <= 1) {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      }
      return {
        ...prev,
        [itemId]: { ...prev[itemId], quantity: currentQty - 1 },
      };
    });
  };

  const cartItemsList = Object.values(cart);
  const cartTotal = cartItemsList.reduce(
    (sum, entry) => sum + entry.item.price * entry.quantity,
    0
  );

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login or register to order food to your room or table.");
      navigate("/login", { state: { from: "/restaurant" } });
      return;
    }

    if (cartItemsList.length === 0) {
      setErrorMessage("Please select at least one item from the menu.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        roomNumber: deliveryType === "room" ? `Room #${roomNumber}` : "Table / Dining Deck",
        items: cartItemsList.map((entry) => ({
          foodItemId: entry.item._id,
          name: entry.item.name,
          price: entry.item.price,
          quantity: entry.quantity,
        })),
        totalAmount: cartTotal,
        paymentMethod,
        notes,
      };

      const res = await api.createFoodOrder(payload);
      if (res.success) {
        setOrderConfirmed(res.order);
        setCart({});
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to place food order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = foodItems.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesVeg = !vegOnly || item.isVeg;
    return matchesCategory && matchesVeg;
  });

  return (
    <div className="restaurant-page">
      <Navbar />

      {/* BANNER */}
      <section className="restaurant-banner">
        <div className="banner-overlay">
          <p>GOURMET RIVERSIDE CULINARY EXPERIENCES</p>
          <h1>The Riverside Treat Dining</h1>
          <span>Artisanal local delicacies, continental grill & in-room fine dining</span>
        </div>
      </section>

      <div className="restaurant-container">
        {orderConfirmed ? (
          /* ORDER CONFIRMATION */
          <div className="order-confirmed-card">
            <div className="order-conf-icon">🥘</div>
            <h2>Order Placed with the Kitchen!</h2>
            <p className="order-id-badge">Order ID: <strong>{orderConfirmed.orderId}</strong></p>
            <p className="order-dest">Delivery Destination: <strong>{orderConfirmed.roomNumber}</strong></p>

            <div className="live-status-tracker">
              <div className="status-step active">
                <div className="circle">1</div>
                <span>New</span>
              </div>
              <div className="status-line active"></div>
              <div className="status-step active">
                <div className="circle">2</div>
                <span>Preparing</span>
              </div>
              <div className="status-line"></div>
              <div className="status-step">
                <div className="circle">3</div>
                <span>Ready</span>
              </div>
              <div className="status-line"></div>
              <div className="status-step">
                <div className="circle">4</div>
                <span>Delivered</span>
              </div>
            </div>

            <div className="order-summary-box">
              <h4>Order Breakdown:</h4>
              {orderConfirmed.items.map((it, idx) => (
                <div key={idx} className="order-summary-row">
                  <span>{it.quantity}x {it.name}</span>
                  <strong>₹{(it.price * it.quantity).toLocaleString()}</strong>
                </div>
              ))}
              <div className="order-summary-total">
                <span>Total Paid ({orderConfirmed.paymentMethod}):</span>
                <strong>₹{orderConfirmed.totalAmount.toLocaleString()}</strong>
              </div>
            </div>

            <div className="order-actions">
              <Link to="/profile" className="btn-order-profile">
                Track Live in My Profile
              </Link>
              <button
                type="button"
                onClick={() => setOrderConfirmed(null)}
                className="btn-order-more"
              >
                Order More Items
              </button>
            </div>
          </div>
        ) : (
          /* MAIN MENU & CART */
          <div className="dining-layout">
            {/* MENU SECTION */}
            <div className="menu-section">
              {/* CATEGORY & VEG TOGGLE */}
              <div className="menu-controls">
                <div className="category-scroll">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={`cat-btn ${selectedCategory === cat ? "active" : ""}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <label className="veg-toggle-label">
                  <input
                    type="checkbox"
                    checked={vegOnly}
                    onChange={(e) => setVegOnly(e.target.checked)}
                  />
                  <span>🌱 Pure Veg Only</span>
                </label>
              </div>

              {loading ? (
                <div className="menu-loading">
                  <div className="spinner"></div>
                  <p>Loading chef's fresh menu...</p>
                </div>
              ) : (
                <div className="dishes-grid">
                  {filteredItems.map((dish) => {
                    const cartQty = cart[dish._id]?.quantity || 0;
                    return (
                      <div className="dish-card" key={dish._id}>
                        <div className="dish-header">
                          <span className={`diet-icon ${dish.isVeg ? "veg" : "non-veg"}`}>
                            {dish.isVeg ? "🟢 Veg" : "🔴 Non-Veg"}
                          </span>
                          <span className="dish-category">{dish.category}</span>
                        </div>

                        <h4 className="dish-name">{dish.name}</h4>
                        <p className="dish-desc">{dish.description}</p>

                        <div className="dish-footer">
                          <strong className="dish-price">₹{dish.price}</strong>

                          {cartQty > 0 ? (
                            <div className="qty-controls">
                              <button
                                type="button"
                                className="qty-btn"
                                onClick={() => removeFromCart(dish._id)}
                              >
                                −
                              </button>
                              <span className="qty-count">{cartQty}</span>
                              <button
                                type="button"
                                className="qty-btn"
                                onClick={() => addToCart(dish)}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="btn-add-cart"
                              onClick={() => addToCart(dish)}
                            >
                              Add +
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CART DRAWER */}
            <div className="cart-sidebar">
              <div className="cart-card">
                <h3>🛒 Your Dining Order</h3>

                {errorMessage && (
                  <div className="cart-error">{errorMessage}</div>
                )}

                {cartItemsList.length === 0 ? (
                  <div className="empty-cart">
                    <p>Your cart is empty.</p>
                    <small>Select delicious dishes from the menu to place an in-room or table dining order.</small>
                  </div>
                ) : (
                  <form onSubmit={handlePlaceOrder}>
                    <div className="cart-items-list">
                      {cartItemsList.map((entry) => (
                        <div className="cart-item-row" key={entry.item._id}>
                          <div className="cart-item-details">
                            <strong>{entry.item.name}</strong>
                            <small>₹{entry.item.price} each</small>
                          </div>

                          <div className="qty-controls mini">
                            <button
                              type="button"
                              onClick={() => removeFromCart(entry.item._id)}
                            >
                              −
                            </button>
                            <span>{entry.quantity}</span>
                            <button
                              type="button"
                              onClick={() => addToCart(entry.item)}
                            >
                              +
                            </button>
                          </div>

                          <span className="cart-item-total">
                            ₹{(entry.item.price * entry.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="cart-form-fields">
                      <div className="field-group">
                        <label>Delivery Preference</label>
                        <select
                          value={deliveryType}
                          onChange={(e) => setDeliveryType(e.target.value)}
                        >
                          <option value="room">Deliver to Hotel Room</option>
                          <option value="table">Dine at Restaurant / Deck Table</option>
                        </select>
                      </div>

                      {deliveryType === "room" && (
                        <div className="field-group">
                          <label>Room Number</label>
                          <input
                            type="text"
                            value={roomNumber}
                            onChange={(e) => setRoomNumber(e.target.value)}
                            placeholder="e.g. 101, 201, 301"
                            required
                          />
                        </div>
                      )}

                      <div className="field-group">
                        <label>Special Instructions</label>
                        <input
                          type="text"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="e.g. Less spicy, extra napkins"
                        />
                      </div>

                      <div className="field-group">
                        <label>Payment Method</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                          <option value="UPI">📱 Instant UPI / QR</option>
                          <option value="Card">💳 Credit / Debit Card</option>
                          <option value="Cash on Delivery">💵 Cash on Delivery / Table</option>
                        </select>
                      </div>
                    </div>

                    <div className="cart-totals">
                      <div className="total-row">
                        <span>Subtotal:</span>
                        <span>₹{cartTotal.toLocaleString()}</span>
                      </div>
                      <div className="total-row">
                        <span>Taxes & Service:</span>
                        <span>Included</span>
                      </div>
                      <div className="total-row grand">
                        <span>Total Payable:</span>
                        <strong>₹{cartTotal.toLocaleString()}</strong>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-order-submit"
                    >
                      {isSubmitting ? "Sending to Kitchen..." : `Place Order (₹${cartTotal.toLocaleString()})`}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Restaurant;
