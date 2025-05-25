package org.example.userservice.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashSet;
import java.util.Set;

@Data
@Document(collection = "users")
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@Builder
public class User {
    @Id
    private String email;
    private String name;
    private String password;
}