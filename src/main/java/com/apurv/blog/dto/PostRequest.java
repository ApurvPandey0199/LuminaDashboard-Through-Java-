package com.apurv.blog.dto;

import com.apurv.blog.model.PostStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PostRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    @Size(max = 500, message = "Summary cannot exceed 500 characters")
    private String summary;

    private String coverImage;

    @Size(max = 60, message = "Category cannot exceed 60 characters")
    private String category;

    private PostStatus status = PostStatus.PUBLISHED;

    public PostRequest() {
    }

    public PostRequest(String title, String content, String summary, String coverImage, String category, PostStatus status) {
        this.title = title;
        this.content = content;
        this.summary = summary;
        this.coverImage = coverImage;
        this.category = category;
        this.status = status;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public PostStatus getStatus() {
        return status;
    }

    public void setStatus(PostStatus status) {
        this.status = status;
    }
}
