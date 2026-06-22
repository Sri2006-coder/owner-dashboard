package com.rentshield.owner.service;

import com.rentshield.owner.dto.VerificationDto;
import com.rentshield.owner.entity.Owner;
import com.rentshield.owner.entity.Verification;
import com.rentshield.owner.enums.OwnerStatus;
import com.rentshield.owner.enums.VerificationStatus;
import com.rentshield.owner.exception.ResourceNotFoundException;
import com.rentshield.owner.repository.OwnerRepository;
import com.rentshield.owner.repository.VerificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class VerificationService {

    private final VerificationRepository verificationRepository;
    private final OwnerRepository ownerRepository;

    public VerificationDto getVerificationByOwner(Long ownerId) {
        Verification verification = verificationRepository.findByOwnerId(ownerId)
                .orElseGet(() -> createDefaultVerification(ownerId));
        return mapToDto(verification);
    }

    @Transactional
    public VerificationDto uploadDocument(Long ownerId, String documentType, String fileName) {
        Verification verification = verificationRepository.findByOwnerId(ownerId)
                .orElseGet(() -> createDefaultVerification(ownerId));

        switch (documentType.toLowerCase()) {
            case "aadhaar":
                verification.setAadhaarDocument(fileName);
                break;
            case "tax_bill":
                verification.setTaxBillDocument(fileName);
                break;
            case "deed":
                verification.setPropertyDeedDocument(fileName);
                break;
            case "selfie":
                verification.setSelfieDocument(fileName);
                break;
            default:
                throw new IllegalArgumentException("Invalid document type");
        }

        verification = verificationRepository.save(verification);
        return mapToDto(verification);
    }

    @Transactional
    public VerificationDto deleteDocument(Long ownerId, String documentType) {
        Verification verification = verificationRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Verification not found for owner " + ownerId));

        switch (documentType.toLowerCase()) {
            case "aadhaar":
                verification.setAadhaarDocument(null);
                break;
            case "tax_bill":
                verification.setTaxBillDocument(null);
                break;
            case "deed":
                verification.setPropertyDeedDocument(null);
                break;
            case "selfie":
                verification.setSelfieDocument(null);
                break;
            default:
                throw new IllegalArgumentException("Invalid document type");
        }

        verification = verificationRepository.save(verification);
        return mapToDto(verification);
    }

    @Transactional
    public VerificationDto submitVerification(Long ownerId) {
        Verification verification = verificationRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Verification not found for owner " + ownerId));

        if (verification.getAadhaarDocument() == null ||
            verification.getTaxBillDocument() == null ||
            verification.getPropertyDeedDocument() == null ||
            verification.getSelfieDocument() == null) {
            throw new IllegalStateException("All 4 documents are required to submit verification.");
        }

        verification.setStatus(VerificationStatus.VERIFIED);
        verification.setSubmittedAt(LocalDateTime.now());
        verification.setVerifiedAt(LocalDateTime.now());
        verification = verificationRepository.save(verification);

        Owner owner = ownerRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));
        owner.setIsVerified(true);
        owner.setStatus(OwnerStatus.ACTIVE);
        ownerRepository.save(owner);

        return mapToDto(verification);
    }

    private Verification createDefaultVerification(Long ownerId) {
        Owner owner = ownerRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));
        Verification verification = Verification.builder()
                .owner(owner)
                .status(VerificationStatus.PENDING)
                .build();
        return verificationRepository.save(verification);
    }

    private VerificationDto mapToDto(Verification verification) {
        return VerificationDto.builder()
                .id(verification.getId())
                .ownerId(verification.getOwner().getId())
                .aadhaarDocument(verification.getAadhaarDocument())
                .taxBillDocument(verification.getTaxBillDocument())
                .propertyDeedDocument(verification.getPropertyDeedDocument())
                .selfieDocument(verification.getSelfieDocument())
                .status(verification.getStatus())
                .submittedAt(verification.getSubmittedAt())
                .verifiedAt(verification.getVerifiedAt())
                .build();
    }
}
