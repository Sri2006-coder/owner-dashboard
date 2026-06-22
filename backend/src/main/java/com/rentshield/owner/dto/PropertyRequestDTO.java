package com.rentshield.owner.dto;

import com.rentshield.owner.enums.PropertyStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyRequestDTO {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Property type is required")
    @Size(max = 50, message = "Property type must not exceed 50 characters")
    private String propertyType;

    @NotNull(message = "Property status is required")
    private PropertyStatus status;

    @NotBlank(message = "Address line is required")
    private String addressLine;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @NotBlank(message = "State is required")
    @Size(max = 100, message = "State must not exceed 100 characters")
    private String state;

    @NotBlank(message = "Postal code is required")
    @Size(max = 20, message = "Postal code must not exceed 20 characters")
    private String postalCode;

    @NotNull(message = "Rent amount is required")
    @Positive(message = "Rent amount must be a positive value")
    private BigDecimal rentAmount;

    @NotNull(message = "Deposit amount is required")
    @Positive(message = "Deposit amount must be a positive value")
    private BigDecimal depositAmount;
}
