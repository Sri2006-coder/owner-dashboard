package com.rentshield.owner.dto;

import com.rentshield.owner.enums.OwnerStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private OwnerStatus status;
    private BigDecimal trustScore;
    private Boolean isVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
