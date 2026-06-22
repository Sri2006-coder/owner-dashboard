package com.rentshield.owner.repository;

import com.rentshield.owner.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByOwnerId(Long ownerId);
    List<Notification> findByOwnerIdAndIsReadFalse(Long ownerId);
}
