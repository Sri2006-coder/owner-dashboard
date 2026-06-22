package com.rentshield.owner.dto;

import com.rentshield.owner.enums.PropertyStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyResponseDTO {
    private Long id;
    private Long ownerId;
    private String title;
    private String description;
    private String propertyType;
    private PropertyStatus status;
    private String addressLine;
    private String city;
    private String state;
    private String postalCode;
    private BigDecimal rentAmount;
    private BigDecimal depositAmount;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
