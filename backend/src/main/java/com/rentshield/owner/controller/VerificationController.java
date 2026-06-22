package com.rentshield.owner.controller;

import com.rentshield.owner.dto.VerificationDto;
import com.rentshield.owner.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/verifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VerificationController {

    private final VerificationService verificationService;

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<VerificationDto> getVerification(@PathVariable Long ownerId) {
        return ResponseEntity.ok(verificationService.getVerificationByOwner(ownerId));
    }

    @PostMapping("/owner/{ownerId}/upload")
    public ResponseEntity<VerificationDto> uploadDocument(
            @PathVariable Long ownerId,
            @RequestParam("type") String documentType,
            @RequestParam("file") MultipartFile file) {
        
        // Simulating file upload locally. In a real app we'd save it to S3 or a local dir.
        // For phase 9 simulation, we'll generate a unique file name reference.
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        
        VerificationDto updated = verificationService.uploadDocument(ownerId, documentType, fileName);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/owner/{ownerId}/document/{documentType}")
    public ResponseEntity<VerificationDto> deleteDocument(
            @PathVariable Long ownerId,
            @PathVariable String documentType) {
        return ResponseEntity.ok(verificationService.deleteDocument(ownerId, documentType));
    }

    @PostMapping("/owner/{ownerId}/submit")
    public ResponseEntity<VerificationDto> submitVerification(@PathVariable Long ownerId) {
        return ResponseEntity.ok(verificationService.submitVerification(ownerId));
    }
}
