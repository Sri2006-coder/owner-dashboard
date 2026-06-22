package com.rentshield.owner.dto;

import com.rentshield.owner.enums.AppointmentStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentResponseDTO {
    private Long id;
    private Long propertyId;
    private Long ownerId;
    private String tenantName;
    private String tenantContact;
    private LocalDateTime appointmentDate;
    private AppointmentStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
