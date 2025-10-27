import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Lightbulb, RefreshCw, Star, MessageSquare } from 'lucide-react';
import { getReviews, getReviewSummary } from '../../api/reviews';
import {Review, ReviewSummary} from '../../api/types'



interface ReviewInsightsProps {
  cafeId: number;
}

const ReviewInsights: React.FC<ReviewInsightsProps> = ({ cafeId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);

// Load reviews
const fetchReviews = async () => {
  try {
    setLoadingReviews(true);
    const res = await getReviews(cafeId);
    setReviews(res?.data ?? []); // ✅ fallback to empty array
  } catch (err) {
    console.error('Error fetching reviews:', err);
    setReviews([]); // ✅ ensure type safety
  } finally {
    setLoadingReviews(false);
  }
};

// Load AI summary
const fetchSummary = async (force = false) => {
  try {
    setLoadingSummary(true);
    const res = await getReviewSummary(cafeId, force);
    setSummary(res?.data ?? null); // ✅ fallback to null
  } catch (err) {
    console.error('Error fetching summary:', err);
    setSummary(null); // ✅ ensure type safety
  } finally {
    setLoadingSummary(false);
  }
};


  useEffect(() => {
    fetchReviews();
    fetchSummary();
  }, [cafeId]);

  // Local computed stats
  const total = reviews.length;
  const avgRating = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  const positive = total ? (reviews.filter(r => r.rating >= 4).length / total) * 100 : 0;
  const negative = total ? (reviews.filter(r => r.rating < 3).length / total) * 100 : 0;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="insights" className="w-full">
        <TabsList>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="reviews">All Reviews</TabsTrigger>
        </TabsList>

        {/* -------- AI INSIGHTS TAB -------- */}
        <TabsContent value="insights">
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row justify-between items-center">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-purple-600" />
                <CardTitle>AI Review Summary</CardTitle>
              </div>
              <button
                onClick={() => fetchSummary(true)}
                disabled={loadingSummary}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <RefreshCw className={`w-4 h-4 ${loadingSummary ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
            </CardHeader>

            <CardContent>
              {loadingSummary ? (
                <p className="text-gray-500 italic">Generating AI summary...</p>
              ) : summary ? (
                <>
                  <p className="text-gray-700 leading-relaxed mb-3">{summary.summary}</p>
                  <Separator className="my-3" />
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    <Badge variant="outline">Reviews: {summary.review_count}</Badge>
                    <Badge variant={summary.cached ? 'outline' : 'default'}>
                      {summary.cached ? 'Cached Result' : 'Freshly Generated'}
                    </Badge>
                    <Badge variant="secondary">Avg Rating: {avgRating.toFixed(1)} ★</Badge>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 italic">No summary available.</p>
              )}
            </CardContent>
          </Card>

          {/* Quick stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Reviews</CardTitle>
                <CardDescription>Across all users</CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{total}</CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Rating</CardTitle>
                <CardDescription>Out of 5</CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {avgRating.toFixed(1)} <Star className="inline w-5 h-5 text-yellow-500" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Positive Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={positive} />
                <p className="text-sm mt-1">{positive.toFixed(0)}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Negative Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={negative} />
                <p className="text-sm mt-1">{negative.toFixed(0)}%</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* -------- ALL REVIEWS TAB -------- */}
        <TabsContent value="reviews">
          {loadingReviews ? (
            <p className="text-gray-500 italic">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-gray-500 italic">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <Card key={r.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <CardTitle className="text-base">
                          {r.rating.toFixed(1)} / 5
                        </CardTitle>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(r.created_at).toLocaleString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="text-gray-700 text-sm flex gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    <p>{r.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReviewInsights;


































// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
// import { Badge } from '../ui/badge';
// import { Progress } from '../ui/progress';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
// import { 
//   TrendingUp, 
//   TrendingDown, 
//   AlertCircle, 
//   Lightbulb, 
//   Star, 
//   MessageSquare,
//   Award,
//   Target,
//   Users,
//   ThumbsUp,
//   ThumbsDown
// } from 'lucide-react';
// import { User, Review } from '../../api/types';
// import { Separator } from '../ui/separator';\

// interface ReviewInsightsProps {
//   user: User;
// }

// interface AIInsight {
//   category: string;
//   sentiment: 'positive' | 'negative' | 'neutral';
//   score: number;
//   frequency: number;
//   examples: string[];
//   suggestions: string[];
// }

// const ReviewInsights: React.FC<ReviewInsightsProps> = ({ user }) => {
//   const [reviews, setReviews] = useState<Review[]>([]);
//   const [insights, setInsights] = useState<AIInsight[]>([]);

//   useEffect(() => {
//     // Load reviews for this restaurant
//     const allReviews: Review[] = JSON.parse(localStorage.getItem('reviews') || '[]');
//     const restaurantReviews = allReviews.filter(r => r.restaurantId === user.restaurantId);
//     setReviews(restaurantReviews);

//     // Generate AI insights
//     if (restaurantReviews.length > 0) {
//       const aiInsights = analyzeReviews(restaurantReviews);
//       setInsights(aiInsights);
//     }
//   }, [user.restaurantId]);

//   const analyzeReviews = (reviews: Review[]): AIInsight[] => {
//     const insights: AIInsight[] = [];

//     // Analyze Food Quality
//     const avgFoodQuality = reviews.reduce((sum, r) => sum + r.foodQuality, 0) / reviews.length;
//     const foodComments = reviews
//       .filter(r => r.categories.includes('Taste') || r.categories.includes('Freshness'))
//       .map(r => r.comment);
    
//     insights.push({
//       category: 'Food Quality',
//       sentiment: avgFoodQuality >= 4 ? 'positive' : avgFoodQuality >= 3 ? 'neutral' : 'negative',
//       score: avgFoodQuality,
//       frequency: foodComments.length,
//       examples: foodComments.slice(0, 3),
//       suggestions: generateFoodSuggestions(avgFoodQuality, reviews)
//     });

//     // Analyze Service
//     const avgService = reviews.reduce((sum, r) => sum + r.serviceQuality, 0) / reviews.length;
//     insights.push({
//       category: 'Service Quality',
//       sentiment: avgService >= 4 ? 'positive' : avgService >= 3 ? 'neutral' : 'negative',
//       score: avgService,
//       frequency: reviews.length,
//       examples: reviews.filter(r => r.serviceQuality < 4).map(r => r.comment).slice(0, 3),
//       suggestions: generateServiceSuggestions(avgService, reviews)
//     });

//     // Analyze Value for Money
//     const avgValue = reviews.reduce((sum, r) => sum + r.valueForMoney, 0) / reviews.length;
//     insights.push({
//       category: 'Value for Money',
//       sentiment: avgValue >= 4 ? 'positive' : avgValue >= 3 ? 'neutral' : 'negative',
//       score: avgValue,
//       frequency: reviews.length,
//       examples: reviews.filter(r => r.valueForMoney < 4).map(r => r.comment).slice(0, 3),
//       suggestions: generateValueSuggestions(avgValue, reviews)
//     });

//     // Analyze Portion Size
//     const portionMentions = reviews.filter(r => r.categories.includes('Portion Size'));
//     if (portionMentions.length > 0) {
//       const avgPortionRating = portionMentions.reduce((sum, r) => sum + r.rating, 0) / portionMentions.length;
//       insights.push({
//         category: 'Portion Size',
//         sentiment: avgPortionRating >= 4 ? 'positive' : avgPortionRating >= 3 ? 'neutral' : 'negative',
//         score: avgPortionRating,
//         frequency: portionMentions.length,
//         examples: portionMentions.map(r => r.comment).slice(0, 3),
//         suggestions: generatePortionSuggestions(avgPortionRating)
//       });
//     }

//     // Analyze Packaging
//     const packagingMentions = reviews.filter(r => r.categories.includes('Packaging'));
//     if (packagingMentions.length > 0) {
//       const avgPackagingRating = packagingMentions.reduce((sum, r) => sum + r.rating, 0) / packagingMentions.length;
//       insights.push({
//         category: 'Packaging',
//         sentiment: avgPackagingRating >= 4 ? 'positive' : avgPackagingRating >= 3 ? 'neutral' : 'negative',
//         score: avgPackagingRating,
//         frequency: packagingMentions.length,
//         examples: packagingMentions.map(r => r.comment).slice(0, 3),
//         suggestions: generatePackagingSuggestions(avgPackagingRating)
//       });
//     }

//     return insights.sort((a, b) => {
//       // Prioritize negative and neutral insights first
//       if (a.sentiment !== b.sentiment) {
//         const order = { negative: 0, neutral: 1, positive: 2 };
//         return order[a.sentiment] - order[b.sentiment];
//       }
//       return a.score - b.score;
//     });
//   };

//   const generateFoodSuggestions = (avgScore: number, reviews: Review[]): string[] => {
//     const suggestions: string[] = [];
    
//     if (avgScore < 3) {
//       suggestions.push('🔴 URGENT: Review recipes and cooking procedures with your chef');
//       suggestions.push('Consider implementing quality control checks before serving');
//       suggestions.push('Survey customers on specific menu items that need improvement');
//     } else if (avgScore < 4) {
//       suggestions.push('Review ingredient quality and freshness standards');
//       suggestions.push('Consider chef training on consistency and plating');
//       suggestions.push('Implement taste testing protocols');
//     } else {
//       suggestions.push('✅ Keep maintaining high food quality standards');
//       suggestions.push('Consider documenting your success recipes for consistency');
//       suggestions.push('Explore new menu items to keep customers excited');
//     }

//     // Check for freshness issues
//     const freshnessIssues = reviews.filter(r => 
//       r.categories.includes('Freshness') && r.rating < 4
//     );
//     if (freshnessIssues.length > 0) {
//       suggestions.push('⚠️ Address freshness concerns - review ingredient storage and rotation');
//     }

//     return suggestions;
//   };

//   const generateServiceSuggestions = (avgScore: number, reviews: Review[]): string[] => {
//     const suggestions: string[] = [];
    
//     if (avgScore < 3) {
//       suggestions.push('🔴 URGENT: Staff training on customer service is critical');
//       suggestions.push('Implement a customer feedback system for immediate issues');
//       suggestions.push('Consider hiring additional staff during peak hours');
//     } else if (avgScore < 4) {
//       suggestions.push('Provide additional customer service training');
//       suggestions.push('Review order fulfillment procedures for efficiency');
//       suggestions.push('Implement a mystery shopper program');
//     } else {
//       suggestions.push('✅ Great service! Recognize and reward your team');
//       suggestions.push('Document best practices to maintain consistency');
//       suggestions.push('Consider service excellence as a competitive advantage');
//     }

//     const speedIssues = reviews.filter(r => 
//       r.categories.includes('Speed') && r.rating < 4
//     );
//     if (speedIssues.length > 0) {
//       suggestions.push('⚠️ Speed is an issue - optimize kitchen workflow and prep time');
//     }

//     return suggestions;
//   };

//   const generateValueSuggestions = (avgScore: number, reviews: Review[]): string[] => {
//     const suggestions: string[] = [];
    
//     if (avgScore < 3) {
//       suggestions.push('🔴 Customers feel prices are too high - consider reviewing pricing strategy');
//       suggestions.push('Introduce combo deals or value meals');
//       suggestions.push('Increase portion sizes or reduce prices on low-performing items');
//     } else if (avgScore < 4) {
//       suggestions.push('Consider introducing loyalty rewards or discounts');
//       suggestions.push('Bundle popular items for better perceived value');
//       suggestions.push('Communicate value through quality ingredients and preparation');
//     } else {
//       suggestions.push('✅ Customers appreciate your pricing - maintain this balance');
//       suggestions.push('Consider premium offerings for customers willing to pay more');
//       suggestions.push('Use value pricing as a marketing advantage');
//     }

//     return suggestions;
//   };

//   const generatePortionSuggestions = (avgScore: number): string[] => {
//     if (avgScore < 3) {
//       return [
//         'Increase portion sizes - customers feel they\'re too small',
//         'Consider offering size options (small, medium, large)',
//         'Review portion standards with kitchen staff'
//       ];
//     } else if (avgScore < 4) {
//       return [
//         'Fine-tune portions for better value perception',
//         'Ensure consistency across all orders',
//         'Consider customer feedback on specific items'
//       ];
//     }
//     return [
//       '✅ Portions are well-received',
//       'Maintain current portion standards',
//       'Use generous portions as a marketing point'
//     ];
//   };

//   const generatePackagingSuggestions = (avgScore: number): string[] => {
//     if (avgScore < 3) {
//       return [
//         'Upgrade packaging quality immediately',
//         'Ensure food arrives intact and at proper temperature',
//         'Consider eco-friendly but sturdy packaging options'
//       ];
//     } else if (avgScore < 4) {
//       return [
//         'Review packaging for specific menu items',
//         'Ensure packaging keeps food at optimal temperature',
//         'Consider branded packaging for better presentation'
//       ];
//     }
//     return [
//       '✅ Packaging is appreciated by customers',
//       'Consider highlighting eco-friendly packaging if applicable',
//       'Maintain current packaging standards'
//     ];
//   };

//   const getOverallStats = () => {
//     if (reviews.length === 0) return { avgRating: 0, positiveRate: 0, negativeRate: 0 };
    
//     const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
//     const positiveReviews = reviews.filter(r => r.rating >= 4).length;
//     const negativeReviews = reviews.filter(r => r.rating <= 2).length;
    
//     return {
//       avgRating: avgRating.toFixed(1),
//       positiveRate: ((positiveReviews / reviews.length) * 100).toFixed(0),
//       negativeRate: ((negativeReviews / reviews.length) * 100).toFixed(0)
//     };
//   };

//   const stats = getOverallStats();

//   if (reviews.length === 0) {
//     return (
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold">Review Insights</h1>
//           <p className="text-muted-foreground">AI-powered analysis of customer feedback</p>
//         </div>

//         <Card className="border-blue-200 bg-blue-50">
//           <CardContent className="p-6">
//             <div className="flex items-start gap-3">
//               <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
//               <div>
//                 <h4 className="font-medium text-blue-900">No Reviews Yet</h4>
//                 <p className="text-sm text-blue-700 mt-1">
//                   Start receiving orders to get customer reviews and AI-powered insights.
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold">Review Insights</h1>
//         <p className="text-muted-foreground">AI-powered analysis of {reviews.length} customer reviews</p>
//       </div>

//       {/* Overall Stats */}
//       <div className="grid gap-4 md:grid-cols-4">
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               Total Reviews
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{reviews.length}</div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               Average Rating
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="flex items-baseline gap-2">
//               <span className="text-2xl font-bold">{stats.avgRating}</span>
//               <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               Positive Reviews
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="flex items-baseline gap-2">
//               <span className="text-2xl font-bold text-green-600">{stats.positiveRate}%</span>
//               <ThumbsUp className="h-5 w-5 text-green-600" />
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               Needs Attention
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="flex items-baseline gap-2">
//               <span className="text-2xl font-bold text-red-600">{stats.negativeRate}%</span>
//               <ThumbsDown className="h-5 w-5 text-red-600" />
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* AI Insights */}
//       <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Lightbulb className="h-5 w-5 text-purple-600" />
//             AI-Powered Insights & Recommendations
//           </CardTitle>
//           <CardDescription>
//             Our AI analyzed your reviews to provide actionable feedback
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-6">
//             {insights.map((insight, index) => (
//               <div key={index}>
//                 {index > 0 && <Separator className="my-6" />}
                
//                 <div className="space-y-4">
//                   {/* Header */}
//                   <div className="flex items-start justify-between">
//                     <div className="flex items-center gap-2">
//                       <h3 className="font-medium">{insight.category}</h3>
//                       {insight.sentiment === 'positive' && (
//                         <Badge variant="default" className="bg-green-600">
//                           <TrendingUp className="h-3 w-3 mr-1" />
//                           Positive
//                         </Badge>
//                       )}
//                       {insight.sentiment === 'neutral' && (
//                         <Badge variant="secondary">
//                           Neutral
//                         </Badge>
//                       )}
//                       {insight.sentiment === 'negative' && (
//                         <Badge variant="destructive">
//                           <TrendingDown className="h-3 w-3 mr-1" />
//                           Needs Attention
//                         </Badge>
//                       )}
//                     </div>
//                     <div className="text-right">
//                       <p className="text-2xl font-bold">{insight.score.toFixed(1)}</p>
//                       <p className="text-xs text-muted-foreground">/5.0</p>
//                     </div>
//                   </div>

//                   {/* Progress Bar */}
//                   <Progress value={(insight.score / 5) * 100} className="h-2" />

//                   {/* Suggestions */}
//                   <div className="bg-white rounded-lg p-4 space-y-2">
//                     <h4 className="text-sm font-medium flex items-center gap-1">
//                       <Target className="h-4 w-4 text-blue-600" />
//                       Actionable Recommendations:
//                     </h4>
//                     <ul className="space-y-1.5">
//                       {insight.suggestions.map((suggestion, idx) => (
//                         <li key={idx} className="text-sm flex items-start gap-2">
//                           <span className="text-blue-600 mt-0.5">•</span>
//                           <span>{suggestion}</span>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>

//                   {/* Examples (for negative/neutral) */}
//                   {insight.sentiment !== 'positive' && insight.examples.length > 0 && (
//                     <div className="bg-white rounded-lg p-4 space-y-2">
//                       <h4 className="text-sm font-medium flex items-center gap-1">
//                         <MessageSquare className="h-4 w-4 text-amber-600" />
//                         Customer Feedback Examples:
//                       </h4>
//                       <ul className="space-y-2">
//                         {insight.examples.map((example, idx) => (
//                           <li key={idx} className="text-sm text-muted-foreground italic border-l-2 border-amber-300 pl-3">
//                             "{example.slice(0, 150)}{example.length > 150 ? '...' : ''}"
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Recent Reviews */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Users className="h-5 w-5" />
//             Recent Reviews
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             {reviews.slice(0, 5).map((review) => (
//               <div key={review.id} className="border rounded-lg p-4 space-y-2">
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <p className="font-medium">{review.userName}</p>
//                     <p className="text-xs text-muted-foreground">
//                       {new Date(review.createdAt).toLocaleDateString()}
//                     </p>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     {[...Array(5)].map((_, i) => (
//                       <Star
//                         key={i}
//                         className={`h-4 w-4 ${
//                           i < review.rating
//                             ? 'fill-yellow-400 text-yellow-400'
//                             : 'text-gray-300'
//                         }`}
//                       />
//                     ))}
//                   </div>
//                 </div>
//                 <p className="text-sm">{review.comment}</p>
//                 {review.categories.length > 0 && (
//                   <div className="flex flex-wrap gap-1">
//                     {review.categories.map((cat) => (
//                       <Badge key={cat} variant="outline" className="text-xs">
//                         {cat}
//                       </Badge>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default ReviewInsights;
