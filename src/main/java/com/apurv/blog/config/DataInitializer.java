package com.apurv.blog.config;

import com.apurv.blog.model.*;
import com.apurv.blog.repository.CommentRepository;
import com.apurv.blog.repository.PostRepository;
import com.apurv.blog.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            logger.info("Database is empty. Initializing seed data for technical assessment evaluation...");

            // Seed primary demo author
            User demoUser = new User(
                    "Apurv Pandey",
                    "demo@example.com",
                    passwordEncoder.encode("Demo@123"),
                    Role.ROLE_USER
            );
            userRepository.save(demoUser);

            // Seed admin author
            User adminUser = new User(
                    "System Administrator",
                    "admin@example.com",
                    passwordEncoder.encode("Admin@123"),
                    Role.ROLE_ADMIN
            );
            userRepository.save(adminUser);

            // Seed Article 1
            Post post1 = new Post(
                    "Building High-Performance REST APIs with Spring Boot 3 and Java 21",
                    "Spring Boot 3 brings first-class support for Java 21 and the modern Jakarta EE ecosystem. In this guide, we dive deep into building robust, resilient RESTful microservices with Spring Security 6, stateless JWT token authentication, and Spring Data JPA.\n\n" +
                    "### Key Architectural Highlights:\n" +
                    "1. **Stateless JWT Security**: Eliminates server-side session overhead and scales effortlessly across cloud instances.\n" +
                    "2. **Hibernate 6 Optimization**: Enhanced SQL query generation and automatic schema verification.\n" +
                    "3. **Virtual Threads in Java 21**: Handles concurrent I/O throughput with minimal thread scheduling penalties.\n\n" +
                    "Implementing clean DTO boundaries with validation annotations ensures data integrity before queries ever touch the persistence layer.",
                    "Explore modern enterprise patterns with Spring Boot 3, Java 21 virtual threads, and stateless JWT authentication for scalable microservices.",
                    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
                    "Java & Spring",
                    PostStatus.PUBLISHED,
                    demoUser
            );
            postRepository.save(post1);

            // Seed Article 2
            Post post2 = new Post(
                    "Relational Database Schema Design and Indexing Strategies for MySQL",
                    "Designing a scalable relational database requires careful consideration of normalization, primary and foreign key constraints, and indexing patterns.\n\n" +
                    "### Relational Constraints:\n" +
                    "- Using **Foreign Key Constraints with ON DELETE CASCADE** guarantees referential integrity between users and their authored articles.\n" +
                    "- Adding **B-Tree indexes on created_at and category** enables lightning-fast filtering and sorting even as the table scales to millions of records.\n" +
                    "- Consistent connection pooling with HikariCP ensures low-latency execution under concurrent traffic.",
                    "A deep dive into MySQL database schema architecture, foreign key integrity, index optimization, and high-concurrency connection pooling.",
                    "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80",
                    "Database Design",
                    PostStatus.PUBLISHED,
                    demoUser
            );
            postRepository.save(post2);

            // Seed Article 3
            Post post3 = new Post(
                    "Zero-Framework Frontend Engineering: Crafting High-Speed Vanilla Web Apps",
                    "While modern SPA frameworks offer great power, pure Vanilla JavaScript, HTML5, and modern CSS3 deliver unmatched performance, zero build complexity, and tiny network footprints.\n\n" +
                    "Using native features like the **Web Fetch API**, modern CSS custom properties (variables), and standard DOM APIs, we can build sleek, responsive, and glassmorphic dashboards that load in milliseconds on any device.",
                    "Why modern Vanilla JavaScript and HTML5 remain supreme for lightweight, ultra-responsive, zero-dependency web applications.",
                    "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
                    "Frontend & Architecture",
                    PostStatus.PUBLISHED,
                    adminUser
            );
            postRepository.save(post3);

            // Seed Comment on Article 1
            Comment comment1 = new Comment(
                    "Exceptional write-up! The breakdown of Spring Security 6 stateless filter chains is spot on.",
                    "Sarah Jenkins",
                    adminUser,
                    post1
            );
            commentRepository.save(comment1);

            logger.info("Seed data initialized successfully. Demo user: demo@example.com / Demo@123");
        }
    }
}
