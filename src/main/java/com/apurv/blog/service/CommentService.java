package com.apurv.blog.service;

import com.apurv.blog.dto.CommentRequest;
import com.apurv.blog.dto.CommentResponse;
import com.apurv.blog.exception.ForbiddenException;
import com.apurv.blog.exception.ResourceNotFoundException;
import com.apurv.blog.model.Comment;
import com.apurv.blog.model.Post;
import com.apurv.blog.model.User;
import com.apurv.blog.repository.CommentRepository;
import com.apurv.blog.repository.PostRepository;
import com.apurv.blog.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Autowired
    public CommentService(CommentRepository commentRepository,
                          PostRepository postRepository,
                          UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByPostId(Long postId) {
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId)
                .stream().map(CommentResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse addComment(Long postId, CommentRequest request, Long currentUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        User user = null;
        String authorName = "Guest Reader";

        if (currentUserId != null) {
            user = userRepository.findById(currentUserId).orElse(null);
            if (user != null) {
                authorName = user.getName();
            }
        }

        if (request.getAuthorName() != null && !request.getAuthorName().isBlank()) {
            authorName = request.getAuthorName().trim();
        }

        Comment comment = new Comment(request.getContent().trim(), authorName, user, post);
        Comment saved = commentRepository.save(comment);
        return CommentResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteComment(Long commentId, Long currentUserId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        boolean isCommentAuthor = comment.getUser() != null && comment.getUser().getId().equals(currentUserId);
        boolean isPostAuthor = comment.getPost() != null && comment.getPost().getAuthor().getId().equals(currentUserId);

        if (!isCommentAuthor && !isPostAuthor) {
            throw new ForbiddenException("Unauthorized: You do not have permission to delete this comment.");
        }

        commentRepository.delete(comment);
    }
}
