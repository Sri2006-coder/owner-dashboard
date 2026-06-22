package com.rentshield.owner.service.impl;

import com.rentshield.owner.dto.NotificationResponseDTO;
import com.rentshield.owner.entity.Notification;
import com.rentshield.owner.exception.ResourceNotFoundException;
import com.rentshield.owner.repository.NotificationRepository;
import com.rentshield.owner.repository.OwnerRepository;
import com.rentshield.owner.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final OwnerRepository ownerRepository;

    // Constructor injection
    public NotificationServiceImpl(NotificationRepository notificationRepository, OwnerRepository ownerRepository) {
        this.notificationRepository = notificationRepository;
        this.ownerRepository = ownerRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getNotificationsByOwnerId(Long ownerId) {
        if (!ownerRepository.existsById(ownerId)) {
            throw new ResourceNotFoundException("Owner with ID " + ownerId + " not found");
        }
        return notificationRepository.findByOwnerId(ownerId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public NotificationResponseDTO markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification with ID " + id + " not found"));

        notification.setIsRead(true);
        Notification updatedNotification = notificationRepository.save(notification);
        return mapToResponseDTO(updatedNotification);
    }

    @Override
    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notification with ID " + id + " not found");
        }
        notificationRepository.deleteById(id);
    }

    // Mapper helper methods
    private NotificationResponseDTO mapToResponseDTO(Notification notification) {
        if (notification == null) return null;
        return NotificationResponseDTO.builder()
                .id(notification.getId())
                .ownerId(notification.getOwner() != null ? notification.getOwner().getId() : null)
                .title(notification.getTitle())
                .message(notification.getMessage())
                .notificationType(notification.getNotificationType())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
