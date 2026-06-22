package com.rentshield.owner.service;

import com.rentshield.owner.dto.PropertyRequestDTO;
import com.rentshield.owner.dto.PropertyResponseDTO;
import java.util.List;

public interface PropertyService {
    PropertyResponseDTO createProperty(Long ownerId, PropertyRequestDTO request);
    PropertyResponseDTO getPropertyById(Long id);
    List<PropertyResponseDTO> getAllProperties();
    List<PropertyResponseDTO> getPropertiesByOwnerId(Long ownerId);
    PropertyResponseDTO updateProperty(Long id, PropertyRequestDTO request);
    void deleteProperty(Long id);
}
