package com.dylask.modules.auth.repository;

import com.dylask.modules.auth.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {

    Optional<EmailVerification> findTopByUserIdOrderByCreatedAtDesc(Long userId);

    @Modifying
    @Query("DELETE FROM EmailVerification ev WHERE ev.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);
}
