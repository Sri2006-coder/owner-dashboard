package com.rentshield.owner.service;

import com.rentshield.owner.dto.ReviewRequestDTO;
import com.rentshield.owner.dto.ReviewResponseDTO;
import java.util.List;

public interface ReviewService {
    ReviewResponseDTO createReview(ReviewRequestDTO request);
    List<ReviewResponseDTO> getReviewsByPropertyId(Long propertyId);
    ReviewResponseDTO replyToReview(Long id, String replyMessage);
}
