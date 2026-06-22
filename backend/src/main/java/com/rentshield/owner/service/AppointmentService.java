package com.rentshield.owner.service;

import com.rentshield.owner.dto.AppointmentRequestDTO;
import com.rentshield.owner.dto.AppointmentResponseDTO;
import com.rentshield.owner.enums.AppointmentStatus;
import java.util.List;

public interface AppointmentService {
    AppointmentResponseDTO createAppointment(AppointmentRequestDTO request);
    AppointmentResponseDTO getAppointmentById(Long id);
    List<AppointmentResponseDTO> getAppointmentsByOwnerId(Long ownerId);
    AppointmentResponseDTO updateAppointmentStatus(Long id, AppointmentStatus status);
    void deleteAppointment(Long id);
}
