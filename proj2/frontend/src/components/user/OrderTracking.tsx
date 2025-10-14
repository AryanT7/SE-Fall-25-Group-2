import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Clock, MapPin, Phone, CheckCircle, Circle, ArrowLeft } from 'lucide-react';
import { Order } from '../../App';

interface OrderTrackingProps {
  user?: User;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ user }) => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    // Load order from localStorage (in real app, this would be an API call)
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      const orders = JSON.parse(savedOrders);
      const foundOrder = orders.find((o: Order) => o.id === orderId);
      setOrder(foundOrder || null);
      
      // Show feedback for completed orders
      if (foundOrder && foundOrder.status === 'completed' && !foundOrder.regretData) {
        setShowFeedback(true);
      }
    }
    setLoading(false);
  }, [orderId]);

  const handleReviewSubmit = (review: Review) => {
    if (!order) return;

    // Save review
    const existingReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    localStorage.setItem('reviews', JSON.stringify([review, ...existingReviews]));

    // Update order with reviewId
    const orders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
    const updatedOrders = orders.map(o => 
      o.id === order.id ? { ...o, reviewId: review.id } : o
    );
    localStorage.setItem('orders', JSON.stringify(updatedOrders));

    // Update local state
    setOrder({ ...order, reviewId: review.id });
    setShowReviewDialog(false);
  };

  const getRestaurantName = (restaurantId: string) => {
    const restaurantNames: { [key: string]: string } = {
      'rest1': 'Pizza Palace',
      'rest2': 'Burger Hub',
      'rest3': 'Sushi Zen',
      'rest4': 'Taco Fiesta',
      'rest5': 'Green Garden',
      'rest6': 'Curry House'
    };
    return restaurantNames[restaurantId] || 'Restaurant';
  };

  const getRestaurantPhone = (restaurantId: string) => {
    const restaurantPhones: { [key: string]: string } = {
      'rest1': '(555) 123-4567',
      'rest2': '(555) 234-5678',
      'rest3': '(555) 345-6789',
      'rest4': '(555) 456-7890',
      'rest5': '(555) 567-8901',
      'rest6': '(555) 678-9012'
    };
    return restaurantPhones[restaurantId] || '(555) 000-0000';
  };

  const getEstimatedTime = (order: Order) => {
    const baseTime = new Date(order.createdAt).getTime();
    const estimatedReady = new Date(baseTime + 30 * 60 * 1000); // 30 minutes
    return estimatedReady;
  };

  const getOrderProgress = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 20;
      case 'accepted':
        return 40;
      case 'preparing':
        return 70;
      case 'ready':
        return 90;
      case 'completed':
        return 100;
      case 'cancelled':
        return 0;
      default:
        return 0;
    }
  };

  const orderSteps = [
    { key: 'pending', label: 'Order Placed', description: 'Your order has been received' },
    { key: 'accepted', label: 'Order Confirmed', description: 'Restaurant confirmed your order' },
    { key: 'preparing', label: 'Preparing', description: 'Your food is being prepared' },
    { key: 'ready', label: 'Ready for Pickup', description: 'Your order is ready to collect' },
    { key: 'completed', label: 'Order Complete', description: 'Order has been picked up' }
  ];

  const getStepStatus = (stepKey: string, currentStatus: Order['status']) => {
    const stepOrder = ['pending', 'accepted', 'preparing', 'ready', 'completed'];
    const currentIndex = stepOrder.indexOf(currentStatus);
    const stepIndex = stepOrder.indexOf(stepKey);
    
    if (currentStatus === 'cancelled') return 'cancelled';
    if (stepIndex <= currentIndex) return 'completed';
    if (stepIndex === currentIndex + 1) return 'current';
    return 'pending';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-medium">Order not found</h3>
            <p className="text-muted-foreground">The order you're looking for doesn't exist.</p>
            <Link to="/orders" className="mt-4 inline-block">
              <Button>Back to Orders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Track Order #{order.id}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Status */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{getRestaurantName(order.restaurantId)}</CardTitle>
                  <CardDescription>
                    Order placed on {new Date(order.createdAt).toLocaleString()}
                  </CardDescription>
                </div>
                <Badge 
                  variant={order.status === 'completed' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {order.status !== 'cancelled' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Order Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {getOrderProgress(order.status)}%
                    </span>
                  </div>
                  <Progress value={getOrderProgress(order.status)} className="h-2" />
                </div>
              )}

              <div className="space-y-4">
                {orderSteps.map((step, index) => {
                  const status = getStepStatus(step.key, order.status);
                  
                  return (
                    <div key={step.key} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : status === 'current' ? (
                          <Circle className="h-5 w-5 text-blue-600 fill-blue-100" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          status === 'completed' ? 'text-green-600' :
                          status === 'current' ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                        {status === 'completed' && step.key === 'accepted' && (
                          <p className="text-xs text-green-600 mt-1">
                            Confirmed at {new Date(new Date(order.createdAt).getTime() + 2 * 60 * 1000).toLocaleTimeString()}
                          </p>
                        )}
                        {status === 'current' && step.key === 'preparing' && (
                          <p className="text-xs text-blue-600 mt-1">
                            Estimated ready time: {getEstimatedTime(order).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {order.status === 'cancelled' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800">Order Cancelled</h4>
                  <p className="text-sm text-red-700 mt-1">
                    This order was cancelled. If you were charged, the refund will be processed within 3-5 business days.
                  </p>
                </div>
              )}

              {order.status === 'ready' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800">Ready for Pickup! 🎉</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your order is ready. Please collect it from the restaurant.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.menuItem.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} • {item.menuItem.calories * item.quantity} cal
                          {item.assignedTo && (
                            <span className="ml-2 text-blue-600">for {item.assignedTo}</span>
                          )}
                        </p>
                      </div>
                      <span className="font-medium">
                        ${(item.menuItem.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Restaurant Info & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">{getRestaurantName(order.restaurantId)}</h4>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>123 Main Street, City</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{getRestaurantPhone(order.restaurantId)}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee:</span>
                  <span>$2.99</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>${(order.totalAmount * 0.08).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>${(order.totalAmount + 2.99 + (order.totalAmount * 0.08)).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Payment Method:</span>
                  <span className="capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Calories:</span>
                  <span>{order.totalCalories} cal</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estimated Times</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Order placed:
                  </span>
                  <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
                </div>
                
                {order.status !== 'cancelled' && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Estimated ready:
                    </span>
                    <span>{getEstimatedTime(order).toLocaleTimeString()}</span>
                  </div>
                )}

                {order.pickupTime && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Picked up:
                    </span>
                    <span>{new Date(order.pickupTime).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {order.status === 'completed' && !order.reviewId && user && (
              <Button 
                className="w-full" 
                onClick={() => setShowReviewDialog(true)}
              >
                <Star className="h-4 w-4 mr-2" />
                Write a Review
              </Button>
            )}

            {order.reviewId && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-sm text-green-800">
                  ✓ Review submitted
                </p>
              </div>
            )}

            <Button className="w-full" asChild>
              <a href={`tel:${getRestaurantPhone(order.restaurantId)}`}>
                <Phone className="h-4 w-4 mr-2" />
                Call Restaurant
              </a>
            </Button>
            
            <Link to="/orders" className="block">
              <Button variant="outline" className="w-full">
                View All Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Post-Order Feedback */}
      {showFeedback && order && order.status === 'completed' && (
        <div className="mt-6">
          <PostOrderFeedback
            order={order}
            onFeedbackSubmit={handleFeedbackSubmit}
          />
        </div>
      )}

      {/* Review Dialog */}
      {user && order && (
        <ReviewDialog
          open={showReviewDialog}
          onClose={() => setShowReviewDialog(false)}
          order={order}
          user={user}
          onReviewSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
};

export default OrderTracking;