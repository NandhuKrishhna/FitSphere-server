# Fetch Reviews & Ratings Workflow

### **1. Endpoint Trigger**

- **Route**: `POST /api/fetch-reviews`
- **Request Body**: Requires `doctorId` (e.g., `{ "doctorId": "65d783c6113d43a8d4d8e7a2" }`).

### **2. Handler Validation**

- **`fetchReviewsAndRatingHandler`**:
  - Converts `req.body.doctorId` to a MongoDB `ObjectId`.
  - Validates `doctorId` using `appAssert()`. Throws `400 BAD_REQUEST` if invalid/missing.

### **3. Use Case Execution**

- **`fetchReviewsAndRating(doctorId)`**:
  - **Reviews Fetch**: Calls `findAllReviewsByDoctorId(doctorId)` from `ReviewsRepository`, which queries `ReviewModel` for all reviews tied to the `doctorId`.
  - **Ratings Fetch**: Calls `findRatingByDoctorId(doctorId)` from `RatingsRepository`, which fetches precomputed `averageRating` and `totalReviews` from `RatingModel`.

### **4. Database Operations**

- **Reviews Collection**:
  - Stores individual reviews (e.g., `reviewText`, `rating` by users).
  - **Query**: `ReviewModel.find({ doctorId })` returns all reviews for the doctor.
- **Ratings Collection**:
  - Stores aggregated stats (`averageRating`, `totalReviews`) for quick access.
  - **Query**: `RatingModel.findOne({ doctorId })` returns cached metrics.

### **5. Response Structure**

- Returns a JSON object with:
  ```json
  {
    "success": true,
    "message": "Reviews and rating fetched successfully",
    "response": {
      "reviews": [...],
      "averageRating": 4.5,
      "totalReviews": 10
    }
  }
  ```

---

### **Key Design Decisions**

- **Decoupled Collections**:
  - **`ReviewModel`**: Stores granular review data (text, individual ratings).
  - **`RatingModel`**: Stores precomputed aggregates to avoid real-time calculations.
- **Efficiency**: Fetching precomputed `averageRating` and `totalReviews` optimizes performance.
- **Fallbacks**: Default to `0` if no ratings exist (`rating?.averageRating || 0`).

### **Dependencies**

- **Repositories**: `ReviewsRepository` and `RatingsRepository` abstract database operations.
- **Error Handling**: Global `catchErrors` wrapper ensures consistent error responses.
