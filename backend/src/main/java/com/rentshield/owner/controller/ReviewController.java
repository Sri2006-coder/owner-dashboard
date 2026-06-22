package com.rentshield.owner.controller;

import com.rentshield.owner.dto.ReviewRequestDTO;
import com.rentshield.owner.dto.ReviewResponseDTO;
import com.rentshield.owner.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    // Constructor injection
    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ReviewResponseDTO> createReview(@Valid @RequestBody ReviewRequestDTO request) {
        ReviewResponseDTO response = reviewService.createReview(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<ReviewResponseDTO>> getReviewsByPropertyId(@PathVariable Long propertyId) {
        List<ReviewResponseDTO> response = reviewService.getReviewsByPropertyId(propertyId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/reply")
    public ResponseEntity<ReviewResponseDTO> replyToReview(
            @PathVariable Long id, @RequestParam String replyMessage) {
        ReviewResponseDTO response = reviewService.replyToReview(id, replyMessage);
        return ResponseEntity.ok(response);
    }
}
