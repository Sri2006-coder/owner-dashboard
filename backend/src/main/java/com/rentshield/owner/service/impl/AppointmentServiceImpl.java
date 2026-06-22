package com.rentshield.owner.service.impl;

import com.rentshield.owner.dto.AppointmentRequestDTO;
import com.rentshield.owner.dto.AppointmentResponseDTO;
import com.rentshield.owner.entity.Appointment;
import com.rentshield.owner.entity.Owner;
import com.rentshield.owner.entity.Property;
import com.rentshield.owner.enums.AppointmentStatus;
import com.rentshield.owner.exception.ResourceNotFoundException;
import com.rentshield.owner.repository.AppointmentRepository;
import com.rentshield.owner.repository.OwnerRepository;
import com.rentshield.owner.repository.PropertyRepository;
import com.rentshield.owner.service.AppointmentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PropertyRepository propertyRepository;
    private final OwnerRepository ownerRepository;

    // Constructor injection
    public AppointmentServiceImpl(AppointmentRepository appointmentRepository, 
                                  PropertyRepository propertyRepository, 
                                  OwnerRepository ownerRepository) {
        this.appointmentRepository = appointmentRepository;
        this.propertyRepository = propertyRepository;
        this.ownerRepository = ownerRepository;
    }

    @Override
    public AppointmentResponseDTO createAppointment(AppointmentRequestDTO request) {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property with ID " + request.getPropertyId() + " not found"));

        Owner owner = property.getOwner();
        if (owner == null) {
            throw new ResourceNotFoundException("Owner associated with this property not found");
        }

        Appointment appointment = mapToEntity(request);
        appointment.setProperty(property);
        appointment.setOwner(owner);
        appointment.setStatus(AppointmentStatus.PENDING);

        Appointment savedAppointment = appointmentRepository.save(appointment);
        return mapToResponseDTO(savedAppointment);
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponseDTO getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment with ID " + id + " not found"));
        return mapToResponseDTO(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getAppointmentsByOwnerId(Long ownerId) {
        if (!ownerRepository.existsById(ownerId)) {
            throw new ResourceNotFoundException("Owner with ID " + ownerId + " not found");
        }
        return appointmentRepository.findByOwnerId(ownerId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AppointmentResponseDTO updateAppointmentStatus(Long id, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment with ID " + id + " not found"));
        
        appointment.setStatus(status);
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return mapToResponseDTO(updatedAppointment);
    }

    @Override
    public void deleteAppointment(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Appointment with ID " + id + " not found");
        }
        appointmentRepository.deleteById(id);
    }

    // Mapper helper methods
    private AppointmentResponseDTO mapToResponseDTO(Appointment appointment) {
        if (appointment == null) return null;
        return AppointmentResponseDTO.builder()
                .id(appointment.getId())
                .propertyId(appointment.getProperty() != null ? appointment.getProperty().getId() : null)
                .ownerId(appointment.getOwner() != null ? appointment.getOwner().getId() : null)
                .tenantName(appointment.getTenantName())
                .tenantContact(appointment.getTenantContact())
                .appointmentDate(appointment.getAppointmentDate())
                .status(appointment.getStatus())
                .notes(appointment.getNotes())
                .createdAt(appointment.getCreatedAt())
                .updatedAt(appointment.getUpdatedAt())
                .build();
    }

    private Appointment mapToEntity(AppointmentRequestDTO dto) {
        if (dto == null) return null;
        return Appointment.builder()
                .tenantName(dto.getTenantName())
                .tenantContact(dto.getTenantContact())
                .appointmentDate(dto.getAppointmentDate())
                .notes(dto.getNotes())
                .build();
    }
}
