package com.apurv.blog.controller;

import com.apurv.blog.dto.PostRequest;
import com.apurv.blog.dto.PostResponse;
import com.apurv.blog.security.UserPrincipal;
import com.apurv.blog.service.PostService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    @Autowired
    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {
        List<PostResponse> posts = postService.getAllPublicPosts(search, category);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable Long id) {
        PostResponse post = postService.getPostById(id);
        return ResponseEntity.ok(post);
    }

    @GetMapping("/my-posts")
    public ResponseEntity<List<PostResponse>> getMyPosts(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<PostResponse> posts = postService.getMyPosts(currentUser.getId());
        return ResponseEntity.ok(posts);
    }

    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            @Valid @RequestBody PostRequest postRequest,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        PostResponse post = postService.createPost(postRequest, currentUser.getId());
        return new ResponseEntity<>(post, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostRequest postRequest,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        PostResponse post = postService.updatePost(id, postRequest, currentUser.getId());
        return ResponseEntity.ok(post);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        postService.deletePost(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
