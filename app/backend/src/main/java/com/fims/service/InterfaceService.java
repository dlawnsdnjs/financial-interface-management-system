package com.fims.service;

import com.fims.domain.InterfaceEntity;
import com.fims.repository.InterfaceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class InterfaceService {

    private final List<ProtocolHandler> handlers;
    private final InterfaceRepository repository;

    public InterfaceService(List<ProtocolHandler> handlers, InterfaceRepository repository) {
        this.handlers = handlers;
        this.repository = repository;
    }

    public Object processInterface(InterfaceEntity entity, Object payload) {
        ProtocolHandler handler = handlers.stream()
                .filter(h -> h.supports(entity.getProtocolType()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported protocol: " + entity.getProtocolType()));

        return handler.execute(entity, entity.getDefaultArguments());
    }

    public List<Object> processBulk(List<Long> ids) {
        List<CompletableFuture<Object>> futures = ids.stream()
                .map(id -> repository.findById(id))
                .filter(opt -> opt.isPresent())
                .map(opt -> opt.get())
                .map(entity -> CompletableFuture.supplyAsync(() -> processInterface(entity, null)))
                .collect(Collectors.toList());

        return futures.stream()
                .map(CompletableFuture::join)
                .collect(Collectors.toList());
    }
}
