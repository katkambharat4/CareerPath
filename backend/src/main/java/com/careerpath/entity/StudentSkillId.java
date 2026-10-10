package com.careerpath.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class StudentSkillId implements Serializable {

    @Column(name = "student_id")
    private Long studentId;

    @Column(name = "skill_id")
    private Long skillId;
}
