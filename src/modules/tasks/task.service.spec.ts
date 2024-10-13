import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { DataAccessLayer } from 'src/infra/database/data-access-layer';
import { ReminderService } from '../reminders/reminder.service';
import { CategoryService } from '../categories/category.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getQueueToken } from '@nestjs/bull';
import { CreateTaskDto } from './dto/task.dto';
import { Task } from 'src/domain/models/task.model';
import { Category } from 'src/domain/models/category.model';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TaskStatus } from 'src/domain/models/enum/task.status.enum';
import { QueueNames } from 'src/domain/queues/queue-names';

describe('TaskService', () => {
    let service: TaskService;
    let dalMock: jest.Mocked<DataAccessLayer>;
    let reminderServiceMock: jest.Mocked<ReminderService>;
    let categoryServiceMock: jest.Mocked<CategoryService>;
    let eventEmitterMock: jest.Mocked<EventEmitter2>;
    let queueMock: jest.Mocked<any>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TaskService,
                {
                    provide: DataAccessLayer,
                    useValue: {
                        task: {
                            createTaskWithCategories: jest.fn(),
                            getTaskByUuidAndUser: jest.fn(),
                            updateTaskStatus: jest.fn(),
                            addCategoriesToTask: jest.fn(),
                            removeCategoriesFromTask: jest.fn(),
                            searchTasks: jest.fn(),
                            getTasksByDeadlineRange: jest.fn(),
                            delete: jest.fn(),
                        },
                    },
                },
                {
                    provide: ReminderService,
                    useValue: {
                        createReminder: jest.fn(),
                        removeReminderJob: jest.fn(),
                    },
                },
                {
                    provide: CategoryService,
                    useValue: {
                        findOrCreateCategories: jest.fn(),
                        findCategoriesByUuids: jest.fn(),
                    },
                },
                {
                    provide: EventEmitter2,
                    useValue: {
                        emit: jest.fn(),
                    },
                },
                {
                    provide: getQueueToken(QueueNames.TaskArchivingQueue),
                    useValue: {
                        add: jest.fn(),
                        removeJobs: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<TaskService>(TaskService);
        dalMock = module.get(DataAccessLayer) as jest.Mocked<DataAccessLayer>;
        reminderServiceMock = module.get(ReminderService) as jest.Mocked<ReminderService>;
        categoryServiceMock = module.get(CategoryService) as jest.Mocked<CategoryService>;
        eventEmitterMock = module.get(EventEmitter2) as jest.Mocked<EventEmitter2>;
        queueMock = module.get(getQueueToken(QueueNames.TaskArchivingQueue));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });


    describe('createTask', () => {
        it('should create a task successfully', async () => {
            const createTaskDto: CreateTaskDto = {
                title: 'Test Task',
                description: 'Test Description',
                deadline: new Date('2023-12-31'),
                reminderTime: new Date('2023-12-30'),
                categoryNames: ['Category1', 'Category2'],
            };
            const userId = 1;
            const mockCategories = [{ id: 1, name: 'Category1' }, { id: 2, name: 'Category2' }];
            const mockCreatedTask = { id: 1, ...createTaskDto } as Task;

            categoryServiceMock.findOrCreateCategories.mockResolvedValue(mockCategories as Category[]);
            dalMock.task.createTaskWithCategories.mockResolvedValue(mockCreatedTask);
            const result = await service.createTask(userId, createTaskDto);

            expect(result).toEqual(mockCreatedTask);
            expect(categoryServiceMock.findOrCreateCategories).toHaveBeenCalledWith(createTaskDto.categoryNames);
            expect(dalMock.task.createTaskWithCategories).toHaveBeenCalled();
            expect(eventEmitterMock.emit).toHaveBeenCalled();
        });

        it('should throw BadRequestException if reminder time is after deadline', async () => {
            const createTaskDto: CreateTaskDto = {
                title: 'Test Task',
                deadline: new Date('2023-12-30'),
                reminderTime: new Date('2023-12-31'),
            };
            const userId = 1;

            await expect(service.createTask(userId, createTaskDto)).rejects.toThrow(BadRequestException);
        });
    });

});