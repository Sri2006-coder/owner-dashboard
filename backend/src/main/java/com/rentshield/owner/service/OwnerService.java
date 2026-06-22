package com.rentshield.owner.service;

import com.rentshield.owner.dto.OwnerRequestDTO;
import com.rentshield.owner.dto.OwnerResponseDTO;
import java.util.List;

public interface OwnerService {
    OwnerResponseDTO createOwner(OwnerRequestDTO request);
    OwnerResponseDTO getOwnerById(Long id);
    List<OwnerResponseDTO> getAllOwners();
    OwnerResponseDTO updateOwner(Long id, OwnerRequestDTO request);
    void deleteOwner(Long id);
}
