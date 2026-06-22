package com.rentshield.owner.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponseDTO {
    private Long id;
    private Long propertyId;
    private String tenantName;
    private Integer rating;
    private String comment;
    private String replyMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
