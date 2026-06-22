package com.rentshield.owner.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponseDTO {
    private Long id;
    private Long ownerId;
    private String title;
    private String message;
    private String notificationType;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
