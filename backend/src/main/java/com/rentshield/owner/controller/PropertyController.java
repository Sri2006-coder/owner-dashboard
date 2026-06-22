package com.rentshield.owner.controller;

import com.rentshield.owner.dto.PropertyRequestDTO;
import com.rentshield.owner.dto.PropertyResponseDTO;
import com.rentshield.owner.service.PropertyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyService propertyService;

    // Constructor injection
    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @PostMapping
    public ResponseEntity<PropertyResponseDTO> createProperty(
            @RequestParam Long ownerId, @Valid @RequestBody PropertyRequestDTO request) {
        PropertyResponseDTO response = propertyService.createProperty(ownerId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropertyResponseDTO> getPropertyById(@PathVariable Long id) {
        PropertyResponseDTO response = propertyService.getPropertyById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<PropertyResponseDTO>> getAllProperties() {
        List<PropertyResponseDTO> response = propertyService.getAllProperties();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<PropertyResponseDTO>> getPropertiesByOwnerId(@PathVariable Long ownerId) {
        List<PropertyResponseDTO> response = propertyService.getPropertiesByOwnerId(ownerId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PropertyResponseDTO> updateProperty(
            @PathVariable Long id, @Valid @RequestBody PropertyRequestDTO request) {
        PropertyResponseDTO response = propertyService.updateProperty(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProperty(@PathVariable Long id) {
        propertyService.deleteProperty(id);
        return ResponseEntity.noContent().build();
    }
}
