package com.examly.springapp.configuration;

import com.examly.springapp.repository.SongRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class UserIsolationEnforcer {
    
    private final SongRepository songRepository;
    
    @Bean
    public ApplicationRunner enforceUserIsolation() {
        return args -> {
            log.info("Enforcing user isolation for collections...");
            
            // Delete any songs without user associations
            try {
                long orphanedCount = songRepository.countOrphanedSongs();
                if (orphanedCount > 0) {
                    log.warn("Found {} orphaned songs, deleting...", orphanedCount);
                    songRepository.deleteOrphanedSongs();
                    log.info("Deleted {} orphaned songs", orphanedCount);
                }
                
                long totalSongs = songRepository.count();
                log.info("User isolation enforced. Total songs in database: {}", totalSongs);
                
            } catch (Exception e) {
                log.error("Error enforcing user isolation: {}", e.getMessage());
            }
        };
    }
}