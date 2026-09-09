package com.apurv.blog.dto;

import com.apurv.blog.model.Comment;
import java.time.LocalDateTime;

public class CommentResponse {

    private Long id;
    private String content;
    private String authorName;
    private Long postId;
    private LocalDateTime createdAt;

    public CommentResponse() {
    }

    public static CommentResponse fromEntity(Comment c) {
        CommentResponse res = new CommentResponse();
        res.setId(c.getId());
        res.setContent(c.getContent());
        res.setAuthorName(c.getAuthorName());
        if (c.getPost() != null) {
            res.setPostId(c.getPost().getId());
        }
        res.setCreatedAt(c.getCreatedAt());
        return res;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
