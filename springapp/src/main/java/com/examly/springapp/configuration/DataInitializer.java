package com.examly.springapp.configuration;

import com.examly.springapp.repository.SongRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final SongRepository songRepository;
    
    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Initializing application data...");
        
        // Clean up any orphaned songs without user associations
        long orphanedSongs = songRepository.countOrphanedSongs();
        if (orphanedSongs > 0) {
            log.warn("Found {} orphaned songs without user associations, cleaning up...", orphanedSongs);
            songRepository.deleteOrphanedSongs();
            log.info("Cleaned up {} orphaned songs", orphanedSongs);
        }
        
        log.info("Data initialization completed successfully");
    }
}