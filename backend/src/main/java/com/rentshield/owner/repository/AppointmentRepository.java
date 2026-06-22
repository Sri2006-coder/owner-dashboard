package com.rentshield.owner.repository;

import com.rentshield.owner.entity.Appointment;
import com.rentshield.owner.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByOwnerId(Long ownerId);
    List<Appointment> findByPropertyId(Long propertyId);
    List<Appointment> findByStatus(AppointmentStatus status);
}
