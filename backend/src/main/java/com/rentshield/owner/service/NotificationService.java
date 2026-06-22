package com.rentshield.owner.service;

import com.rentshield.owner.dto.NotificationResponseDTO;
import java.util.List;

public interface NotificationService {
    List<NotificationResponseDTO> getNotificationsByOwnerId(Long ownerId);
    NotificationResponseDTO markAsRead(Long id);
    void deleteNotification(Long id);
}
