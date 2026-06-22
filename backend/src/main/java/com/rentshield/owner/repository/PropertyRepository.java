package com.rentshield.owner.repository;

import com.rentshield.owner.entity.Property;
import com.rentshield.owner.enums.PropertyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByOwnerId(Long ownerId);
    List<Property> findByStatus(PropertyStatus status);
}
