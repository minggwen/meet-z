package com.c108.meetz.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record CompletedMeetingResponseDto(
        int meetingId,
        String meetingName,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm") LocalDateTime meetingStart,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm") LocalDateTime meetingEnd,
        int cnt
) { }