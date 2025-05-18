package org.example.endoflifeservice.model;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "satellites")
@Getter@Setter@AllArgsConstructor@NoArgsConstructor@Builder
public class Satellite {

    private String id;
    private String name;
    @JsonProperty("norad_id")
    private int norad;
    private String Owner;
    private String launchDate;
    private String launchSite;
    private String popular;

}
