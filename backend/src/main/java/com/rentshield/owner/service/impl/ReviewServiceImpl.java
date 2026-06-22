package com.rentshield.owner.service.impl;

import com.rentshield.owner.dto.ReviewRequestDTO;
import com.rentshield.owner.dto.ReviewResponseDTO;
import com.rentshield.owner.entity.Property;
import com.rentshield.owner.entity.Review;
import com.rentshield.owner.exception.ResourceNotFoundException;
import com.rentshield.owner.repository.PropertyRepository;
import com.rentshield.owner.repository.ReviewRepository;
import com.rentshield.owner.service.ReviewService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final PropertyRepository propertyRepository;

    // Constructor injection
    public ReviewServiceImpl(ReviewRepository reviewRepository, PropertyRepository propertyRepository) {
        this.reviewRepository = reviewRepository;
        this.propertyRepository = propertyRepository;
    }

    @Override
    public ReviewResponseDTO createReview(ReviewRequestDTO request) {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property with ID " + request.getPropertyId() + " not found"));

        Review review = mapToEntity(request);
        review.setProperty(property);

        Review savedReview = reviewRepository.save(review);
        return mapToResponseDTO(savedReview);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getReviewsByPropertyId(Long propertyId) {
        if (!propertyRepository.existsById(propertyId)) {
            throw new ResourceNotFoundException("Property with ID " + propertyId + " not found");
        }
        return reviewRepository.findByPropertyId(propertyId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ReviewResponseDTO replyToReview(Long id, String replyMessage) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review with ID " + id + " not found"));

        review.setReplyMessage(replyMessage);
        Review updatedReview = reviewRepository.save(review);
        return mapToResponseDTO(updatedReview);
    }

    // Mapper helper methods
    private ReviewResponseDTO mapToResponseDTO(Review review) {
        if (review == null) return null;
        return ReviewResponseDTO.builder()
                .id(review.getId())
                .propertyId(review.getProperty() != null ? review.getProperty().getId() : null)
                .tenantName(review.getTenantName())
                .rating(review.getRating())
                .comment(review.getComment())
                .replyMessage(review.getReplyMessage())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }

    private Review mapToEntity(ReviewRequestDTO dto) {
        if (dto == null) return null;
        return Review.builder()
                .tenantName(dto.getTenantName())
                .rating(dto.getRating())
                .comment(dto.getComment())
                .build();
    }
}
