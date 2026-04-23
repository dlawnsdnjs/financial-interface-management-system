package com.fims.controller;

import com.fims.dto.SoapOperationDto;
import com.fims.service.SoapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/interfaces")
@RequiredArgsConstructor
public class SoapController {

    private final SoapService soapService;

    @GetMapping("/soap/operations")
    public ResponseEntity<List<SoapOperationDto>> getSoapOperations(@RequestParam String wsdlUrl) {
        try {
            return ResponseEntity.ok(soapService.getOperations(wsdlUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
