package com.rentshield.owner.dto;

import com.rentshield.owner.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationDto {
    private Long id;
    private Long ownerId;
    private String aadhaarDocument;
    private String taxBillDocument;
    private String propertyDeedDocument;
    private String selfieDocument;
    private VerificationStatus status;
    private LocalDateTime submittedAt;
    private LocalDateTime verifiedAt;
}
