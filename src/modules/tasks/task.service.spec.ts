import { Test, TestingModule } from "@nestjs/testing";
import { TaskService } from "./task.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Category } from "src/domain/models/category.model";
import { Task } from "src/domain/models/task.model";
import { DataAccessLayer } from "src/infra/database/data-access-layer";
import { CategoryService } from "../categories/category.service";
import { CreateTaskDto } from "./dto/task.dto";
import { ReminderService } from "../reminders/reminder.service";
import { getQueueToken } from "@nestjs/bull";
import { QueueNames } from "src/domain/queues/queue-names";
import { BadRequestException, NotFoundException } from "@nestjs/common";

const mockReminderService = {
  createReminder: jest.fn(),
};

const mockCategoryService = {
  findOrCreateCategories: jest.fn(),
};

const mockDataAccessLayer = {
  task: {
    createTaskWithCategories: jest.fn(),
  },
};

const mockEventEmitter = {
  emit: jest.fn(),
};

const mockQueue = {
  add: jest.fn(),
};

describe("TaskService", () => {
  let service: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: CategoryService, useValue: mockCategoryService },
        { provide: ReminderService, useValue: mockReminderService },
        { provide: DataAccessLayer, useValue: mockDataAccessLayer },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        {
          provide: getQueueToken(QueueNames.TaskArchivingQueue),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createTask", () => {
    it("should throw BadRequestException when reminder time is not before deadline", async () => {
      const createTaskDto: CreateTaskDto = {
        title: "Test Task",
        description: "Test Description",
        deadline: new Date("2023-12-30"),
        reminderTime: new Date("2023-12-31"),
        categoryNames: ["Category1"],
      };
      const userId = 1;

      await expect(service.createTask(userId, createTaskDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createTask(userId, createTaskDto)).rejects.toThrow(
        "Reminder time must be before the deadline",
      );

      expect(
        mockDataAccessLayer.task.createTaskWithCategories,
      ).not.toHaveBeenCalled();
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it("should create a task successfully", async () => {
      const createTaskDto: CreateTaskDto = {
        title: "Test Task",
        description: "Test Description",
        deadline: new Date("2023-12-31"),
        reminderTime: new Date("2023-12-30"),
        categoryNames: ["Category1", "Category2"],
      };
      const userId = 1;
      const mockCategories = [
        { id: 1, name: "Category1" },
        { id: 2, name: "Category2" },
      ] as Category[];
      const mockCreatedTask = {
        id: 1,
        uuid: "test-uuid",
        ...createTaskDto,
        userId,
      } as Task;

      mockCategoryService.findOrCreateCategories.mockResolvedValue(
        mockCategories,
      );
      mockDataAccessLayer.task.createTaskWithCategories.mockResolvedValue(
        mockCreatedTask,
      );

      const result = await service.createTask(userId, createTaskDto);

      expect(result).toEqual(mockCreatedTask);
      expect(mockCategoryService.findOrCreateCategories).toHaveBeenCalledWith(
        createTaskDto.categoryNames,
      );
      expect(
        mockDataAccessLayer.task.createTaskWithCategories,
      ).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalled();
    });

    it("should create a task without categories", async () => {
      const createTaskDto: CreateTaskDto = {
        title: "Test Task",
        description: "Test Description",
        deadline: new Date("2023-12-31"),
        reminderTime: new Date("2023-12-30"),
      };
      const userId = 1;
      const mockCreatedTask = {
        id: 1,
        uuid: "test-uuid",
        ...createTaskDto,
        userId,
      } as Task;

      mockDataAccessLayer.task.createTaskWithCategories.mockResolvedValue(
        mockCreatedTask,
      );

      const result = await service.createTask(userId, createTaskDto);

      expect(result).toEqual(mockCreatedTask);
      expect(mockCategoryService.findOrCreateCategories).not.toHaveBeenCalled();
      expect(
        mockDataAccessLayer.task.createTaskWithCategories,
      ).toHaveBeenCalledWith(expect.any(Task), []);
      expect(mockEventEmitter.emit).toHaveBeenCalled();
    });
  });
});
