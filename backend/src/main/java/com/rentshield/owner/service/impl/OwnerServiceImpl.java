package com.rentshield.owner.service.impl;

import com.rentshield.owner.dto.OwnerRequestDTO;
import com.rentshield.owner.dto.OwnerResponseDTO;
import com.rentshield.owner.entity.Owner;
import com.rentshield.owner.exception.DuplicateResourceException;
import com.rentshield.owner.exception.ResourceNotFoundException;
import com.rentshield.owner.repository.OwnerRepository;
import com.rentshield.owner.service.OwnerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OwnerServiceImpl implements OwnerService {

    private final OwnerRepository ownerRepository;

    // Constructor injection
    public OwnerServiceImpl(OwnerRepository ownerRepository) {
        this.ownerRepository = ownerRepository;
    }

    @Override
    public OwnerResponseDTO createOwner(OwnerRequestDTO request) {
        if (ownerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Owner with email " + request.getEmail() + " already exists");
        }
        Owner owner = mapToEntity(request);
        Owner savedOwner = ownerRepository.save(owner);
        return mapToResponseDTO(savedOwner);
    }

    @Override
    @Transactional(readOnly = true)
    public OwnerResponseDTO getOwnerById(Long id) {
        Owner owner = ownerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Owner with ID " + id + " not found"));
        return mapToResponseDTO(owner);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OwnerResponseDTO> getAllOwners() {
        return ownerRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public OwnerResponseDTO updateOwner(Long id, OwnerRequestDTO request) {
        Owner owner = ownerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Owner with ID " + id + " not found"));

        // If email is changing, verify the new email is unique
        if (!owner.getEmail().equalsIgnoreCase(request.getEmail()) 
                && ownerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Owner with email " + request.getEmail() + " already exists");
        }

        owner.setName(request.getName());
        owner.setEmail(request.getEmail());
        owner.setPhone(request.getPhone());
        owner.setPasswordHash(request.getPassword()); // Real application should encode this password

        Owner updatedOwner = ownerRepository.save(owner);
        return mapToResponseDTO(updatedOwner);
    }

    @Override
    public void deleteOwner(Long id) {
        if (!ownerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Owner with ID " + id + " not found");
        }
        ownerRepository.deleteById(id);
    }

    // Mapper helper methods
    private OwnerResponseDTO mapToResponseDTO(Owner owner) {
        if (owner == null) return null;
        return OwnerResponseDTO.builder()
                .id(owner.getId())
                .name(owner.getName())
                .email(owner.getEmail())
                .phone(owner.getPhone())
                .status(owner.getStatus())
                .trustScore(owner.getTrustScore())
                .isVerified(owner.getIsVerified())
                .createdAt(owner.getCreatedAt())
                .updatedAt(owner.getUpdatedAt())
                .build();
    }

    private Owner mapToEntity(OwnerRequestDTO dto) {
        if (dto == null) return null;
        return Owner.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .passwordHash(dto.getPassword())
                .build();
    }
}
