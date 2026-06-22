package com.rentshield.owner.controller;

import com.rentshield.owner.dto.NotificationResponseDTO;
import com.rentshield.owner.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    // Constructor injection
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<NotificationResponseDTO>> getNotificationsByOwnerId(@PathVariable Long ownerId) {
        List<NotificationResponseDTO> response = notificationService.getNotificationsByOwnerId(ownerId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponseDTO> markAsRead(@PathVariable Long id) {
        NotificationResponseDTO response = notificationService.markAsRead(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}
