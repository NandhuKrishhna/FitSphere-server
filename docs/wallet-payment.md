Reviews & Ratings Workflow

1. Endpoint Trigger
   Fetch Reviews & Ratings

Route: POST /api/fetch-reviews
Request Body: Requires doctorId (e.g., { "doctorId": "65d783c6113d43a8d4d8e7a2" }).
Submit a Review & Rating

Route: POST /api/add-review
Request Body: Requires userId, doctorId, rating, and reviewText. 2. Handler Validation
fetchReviewsAndRatingHandler:

Converts req.body.doctorId to a MongoDB ObjectId.
Validates doctorId using appAssert(). Throws 400 BAD_REQUEST if invalid/missing.
createReviewHandler:

Ensures userId, doctorId, rating, and reviewText are provided.
Uses appAssert() to validate input before processing. 3. Use Case Execution
Fetching Reviews & Ratings (fetchReviewsAndRating(doctorId))

Reviews Fetch: Calls findAllReviewsByDoctorId(doctorId) from ReviewsRepository, which queries ReviewModel for all reviews tied to the doctorId.
Ratings Fetch: Calls findRatingByDoctorId(doctorId) from RatingsRepository, which fetches precomputed averageRating and totalReviews from RatingModel.
Submitting a Review (createReview({ userId, doctorId, rating, reviewText }))

Saves the review in ReviewModel.
Fetches all reviews for the doctorId to compute new averageRating and totalReviews.
Updates RatingModel with the new rating stats using updateRating(). 4. Database Operations
Reviews Collection (ReviewModel)

Stores individual user reviews, including reviewText, rating, and doctorId.
Query: ReviewModel.find({ doctorId }) fetches all reviews for a doctor.
Ratings Collection (RatingModel)

Stores aggregated stats (averageRating, totalReviews) for fast retrieval.
Query: RatingModel.findOne({ doctorId }) fetches cached rating data.
Updating Ratings (updateRating())

Calculates averageRating from existing reviews.
Updates or inserts rating data into RatingModel. 5. Response Structure
Fetching Reviews & Ratings Response
json
Copy
Edit
{
"success": true,
"message": "Reviews and rating fetched successfully",
"response": {
"reviews": [...],
"averageRating": 4.5,
"totalReviews": 10
}
}
Submitting a Review Response
json
Copy
Edit
{
"success": true,
"message": "Review added successfully"
}
Key Design Decisions
Separation of Concerns:

ReviewModel handles detailed review storage.
RatingModel maintains aggregated statistics for efficient querying.
Optimized Performance:

Precomputed averageRating and totalReviews prevent real-time recalculations.
Using MongoDB indexes for doctorId improves query efficiency.
Error Handling:

appAssert() ensures required fields are validated before database operations.
catchErrors() wraps handlers to standardize error responses.
Dependencies
Repositories:

ReviewsRepository for CRUD operations on ReviewModel.
RatingsRepository for managing RatingModel.
Frameworks & Libraries:

typedi for dependency injection.
MongoDB for data storage.
