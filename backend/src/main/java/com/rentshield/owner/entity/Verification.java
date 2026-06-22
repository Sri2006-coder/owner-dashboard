package com.rentshield.owner.entity;

import com.rentshield.owner.enums.VerificationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "verification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Verification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "owner_id", nullable = false, unique = true)
    private Owner owner;

    @Column(name = "aadhaar_document")
    private String aadhaarDocument;

    @Column(name = "tax_bill_document")
    private String taxBillDocument;

    @Column(name = "property_deed_document")
    private String propertyDeedDocument;

    @Column(name = "selfie_document")
    private String selfieDocument;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false)
    @Builder.Default
    private VerificationStatus status = VerificationStatus.PENDING;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
}
