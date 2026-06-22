package com.rentshield.owner.service.impl;

import com.rentshield.owner.dto.PropertyRequestDTO;
import com.rentshield.owner.dto.PropertyResponseDTO;
import com.rentshield.owner.entity.Owner;
import com.rentshield.owner.entity.Property;
import com.rentshield.owner.entity.PropertyImage;
import com.rentshield.owner.exception.ResourceNotFoundException;
import com.rentshield.owner.repository.OwnerRepository;
import com.rentshield.owner.repository.PropertyRepository;
import com.rentshield.owner.service.PropertyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PropertyServiceImpl implements PropertyService {

    private final PropertyRepository propertyRepository;
    private final OwnerRepository ownerRepository;

    // Constructor injection
    public PropertyServiceImpl(PropertyRepository propertyRepository, OwnerRepository ownerRepository) {
        this.propertyRepository = propertyRepository;
        this.ownerRepository = ownerRepository;
    }

    @Override
    public PropertyResponseDTO createProperty(Long ownerId, PropertyRequestDTO request) {
        Owner owner = ownerRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner with ID " + ownerId + " not found"));

        Property property = mapToEntity(request);
        property.setOwner(owner);

        Property savedProperty = propertyRepository.save(property);
        return mapToResponseDTO(savedProperty);
    }

    @Override
    @Transactional(readOnly = true)
    public PropertyResponseDTO getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property with ID " + id + " not found"));
        return mapToResponseDTO(property);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyResponseDTO> getAllProperties() {
        return propertyRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyResponseDTO> getPropertiesByOwnerId(Long ownerId) {
        if (!ownerRepository.existsById(ownerId)) {
            throw new ResourceNotFoundException("Owner with ID " + ownerId + " not found");
        }
        return propertyRepository.findByOwnerId(ownerId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PropertyResponseDTO updateProperty(Long id, PropertyRequestDTO request) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property with ID " + id + " not found"));

        property.setTitle(request.getTitle());
        property.setDescription(request.getDescription());
        property.setPropertyType(request.getPropertyType());
        property.setStatus(request.getStatus());
        property.setAddressLine(request.getAddressLine());
        property.setCity(request.getCity());
        property.setState(request.getState());
        property.setPostalCode(request.getPostalCode());
        property.setRentAmount(request.getRentAmount());
        property.setDepositAmount(request.getDepositAmount());

        Property updatedProperty = propertyRepository.save(property);
        return mapToResponseDTO(updatedProperty);
    }

    @Override
    public void deleteProperty(Long id) {
        if (!propertyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Property with ID " + id + " not found");
        }
        propertyRepository.deleteById(id);
    }

    // Mapper helper methods
    private PropertyResponseDTO mapToResponseDTO(Property property) {
        if (property == null) return null;
        List<String> imageUrls = null;
        if (property.getImages() != null) {
            imageUrls = property.getImages().stream()
                    .map(PropertyImage::getImageUrl)
                    .collect(Collectors.toList());
        }

        return PropertyResponseDTO.builder()
                .id(property.getId())
                .ownerId(property.getOwner() != null ? property.getOwner().getId() : null)
                .title(property.getTitle())
                .description(property.getDescription())
                .propertyType(property.getPropertyType())
                .status(property.getStatus())
                .addressLine(property.getAddressLine())
                .city(property.getCity())
                .state(property.getState())
                .postalCode(property.getPostalCode())
                .rentAmount(property.getRentAmount())
                .depositAmount(property.getDepositAmount())
                .imageUrls(imageUrls)
                .createdAt(property.getCreatedAt())
                .updatedAt(property.getUpdatedAt())
                .build();
    }

    private Property mapToEntity(PropertyRequestDTO dto) {
        if (dto == null) return null;
        return Property.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .propertyType(dto.getPropertyType())
                .status(dto.getStatus())
                .addressLine(dto.getAddressLine())
                .city(dto.getCity())
                .state(dto.getState())
                .postalCode(dto.getPostalCode())
                .rentAmount(dto.getRentAmount())
                .depositAmount(dto.getDepositAmount())
                .build();
    }
}
