package com.dylask;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@EnableJpaAuditing
@EnableScheduling
@SpringBootApplication
public class DylaskBackendApplication {

	public static void main(String[] args) {
		loadEnvFile();
		SpringApplication.run(DylaskBackendApplication.class, args);
	}

	private static void loadEnvFile() {
		Path[] searchPaths = new Path[]{
				Path.of(".env"),
				Path.of("../.env")
		};
		for (Path path : searchPaths) {
			if (Files.isRegularFile(path)) {
				try {
					List<String> lines = Files.readAllLines(path);
					for (String line : lines) {
						line = line.trim();
						if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
							continue;
						}
						int eqIdx = line.indexOf('=');
						String key = line.substring(0, eqIdx).trim();
						String value = line.substring(eqIdx + 1).trim();

						if (value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) {
							value = value.substring(1, value.length() - 1);
						} else if (value.startsWith("'") && value.endsWith("'") && value.length() >= 2) {
							value = value.substring(1, value.length() - 1);
						}

						if ("MAIL_PASSWORD".equalsIgnoreCase(key)) {
							value = value.replace(" ", "");
						}

						if (System.getProperty(key) == null && System.getenv(key) == null) {
							System.setProperty(key, value);
						}
					}
					break;
				} catch (Exception ignored) {
					// Fallback to defaults
				}
			}
		}
	}

}
