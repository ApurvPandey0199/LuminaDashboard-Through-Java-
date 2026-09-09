package com.apurv.blog.service;

import com.apurv.blog.dto.PostRequest;
import com.apurv.blog.dto.PostResponse;
import com.apurv.blog.exception.ForbiddenException;
import com.apurv.blog.exception.ResourceNotFoundException;
import com.apurv.blog.model.Post;
import com.apurv.blog.model.PostStatus;
import com.apurv.blog.model.User;
import com.apurv.blog.repository.PostRepository;
import com.apurv.blog.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Autowired
    public PostService(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getAllPublicPosts(String search, String category) {
        String queryParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String categoryParam = (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("All"))
                ? category.trim()
                : null;

        List<Post> posts = postRepository.searchPosts(PostStatus.PUBLISHED, categoryParam, queryParam);
        return posts.stream().map(PostResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PostResponse getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", id));
        return PostResponse.fromEntity(post);
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getMyPosts(Long currentUserId) {
        List<Post> posts = postRepository.findByAuthorIdOrderByCreatedAtDesc(currentUserId);
        return posts.stream().map(PostResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public PostResponse createPost(PostRequest request, Long currentUserId) {
        User author = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        Post post = new Post(
                request.getTitle().trim(),
                request.getContent(),
                request.getSummary(),
                request.getCoverImage(),
                request.getCategory() != null ? request.getCategory().trim() : "General",
                request.getStatus() != null ? request.getStatus() : PostStatus.PUBLISHED,
                author
        );

        Post saved = postRepository.save(post);
        return PostResponse.fromEntity(saved);
    }

    @Transactional
    public PostResponse updatePost(Long id, PostRequest request, Long currentUserId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", id));

        // Enforce strict author ownership authorization
        if (!post.getAuthor().getId().equals(currentUserId)) {
            throw new ForbiddenException("Unauthorized: You do not have permission to modify this post.");
        }

        post.setTitle(request.getTitle().trim());
        post.setContent(request.getContent());
        if (request.getSummary() != null && !request.getSummary().isBlank()) {
            post.setSummary(request.getSummary());
        }
        if (request.getCoverImage() != null) {
            post.setCoverImage(request.getCoverImage());
        }
        if (request.getCategory() != null) {
            post.setCategory(request.getCategory().trim());
        }
        if (request.getStatus() != null) {
            post.setStatus(request.getStatus());
        }

        Post updated = postRepository.save(post);
        return PostResponse.fromEntity(updated);
    }

    @Transactional
    public void deletePost(Long id, Long currentUserId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", id));

        // Enforce strict author ownership authorization
        if (!post.getAuthor().getId().equals(currentUserId)) {
            throw new ForbiddenException("Unauthorized: You do not have permission to delete this post.");
        }

        postRepository.delete(post);
    }
}
